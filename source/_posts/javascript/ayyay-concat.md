---
title: 一个 Array.concat 引发的血案
category: JavaScript
tag: 
- JavaScript
- 稳定性
date: 2021-01-19
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


在之前的 提升 Node.js 服务稳定性，需要关注哪些指标？这篇文章中，我们介绍了服务端稳定性需要关注的一些指标，其中有一个非常重要的指标 `Libuv latency`，计算方式如下：

```js
const kInterval = 1000;
const start = getCurrentTs();
setTimeout(() => {
    const delay = Math.max(getCurrentTs() - start - kInterval, 0);
}, kInterval);
```

从代码中我们就能分析出，`latency` 数值较高通常意味着当前应用的 `eventloop` 过于繁忙，导致简单的操作也不能按时完成。

而对于 `Node.js` 进程来说，这类情况很可能是由调用了耗时较长的同步函数或是阻塞的 `IO` 操作导致。发生这类问题时，对应的线程将没办法进行正常的服务，比如对于 `HTTP server` 来说，在这段时间内的请求会得不到响应。因此我们需要保证主线程的 `libuv latency` 尽可能的小。

## 报警

一个平静的下午，我突然收到了 `Libuv latency` 的报警：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/537ff54a3cef47f0b72076a41533081d~tplv-k3u1fbpfcp-zoom-1.image)

我们设置的 `Libuv latency` 的报警阈值是 `5000ms`，也就是说发生报警时我的服务器至少已经产生了 `5S` 的延时！

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e38b7333b6bd45788dea3826c75d17f8~tplv-k3u1fbpfcp-zoom-1.image)

一般很少有 `libuv latency` 一直很高的情况发生。因为这类情况很可能表明进程已经不能正常服务，通常 CPU 、内存等指标也会出现很明显的异常情况。我们再来看同一时间的 CPU Load、内存、GC：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4411a6ef4c384689a207e337590fe2a3~tplv-k3u1fbpfcp-zoom-1.image)

可以发现这段时间内 `CPU Load`、内存、GC 同时升高，说明主线程正在执行一个耗时较长的同步函数导致线程阻塞。

想要知道分析出这段时间发生了什么，我们可以需要借助 `CPU Profile`。

## CPU Profile

简单理解 `CPU Profile` 的原理就是：在一段时间内用很高的频率不断获取当前 `JavaScript` 调用栈，从而我们可以分析出哪些函数耗时最长。

`Profiling` 技术是一种在应用运行时收集程序相关信息的动态分析手段，利用 `V8` 的 `Profiling API` 可以帮助我们创建一个 `CPU Profile`，从而了解一段时间内进程在执行哪些 `js` 函数。

```js
const profiler = require ( 'v8-profiler-node8' ); 
const fs = require ( 'fs' ); 
const Bluebird = require ( 'bluebird' ); 
class PackageController extends Controller { 
    async cpuProf () { 
        console.log( '开始收集' ); 
        // Start Profiling profiler . startProfiling ( 'CPU profile' ); 
        await Bluebird.delay( 60000 * 5 ); 
        const profile = profiler.stopProfiling();
        profile.export()
        .pipe(fs.createWriteStream(`cpuprofile-${Date.now()}.cpuprofile`))
        .on('finish',() => profile. delete ());
    } 
}
```

注意，开始生成 `CPU Profile` 后我们需要去立即复现问题，从而能让我们在 `Profile` 中看到正确的分析结果，收集完成后，得到一个 `cpuProfile` 文件，`Chrome` 自带了分析 `CPU` profile 日志的工具。打开 Chrome -> 调出开发者工具（DevTools） -> 单击右上角三个点的按钮 -> More tools -> JavaScript Profiler -> Load，加载刚才生成的 `cpuprofile` 文件。可以直接用chrome的性能分析直接读这个文件打开分析：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57a8944335d4466cac56fb493bfda895~tplv-k3u1fbpfcp-zoom-1.image)

函数占用的时间轴越长，说明这个函数耗时越长，上图我们可以很明显的看到， `handleProblemRanking` 这个函数占用了7秒之多。

## 定位代码问题

我们简化一下这个函数：

```js
function handleProblemRanking(tasks) {
  // ...
  let problems = [];
  for (let i = 0; i < problemTask.length; i++) {
    const models = problemTask[i].problems;
    problems = problems.concat(models);
  }
  // ...
}
```

里面有一个循环 `concat` 的操作，于是我在本地 `mock` 了一些数据，打印了一下执行时间，如果循环万次以上，执行时间居然都是秒级别的。如果把以上代码换成下面的代码，执行时间立马回到毫秒级别：

```js
function handleProblemRanking(tasks) {
  // ...
  let problems = [];
  for (let i = 0; i < problemTask.length; i++) {
    const models = problemTask[i].problems;
    problems.push(...models);
  }
  // ...
}
```

然后我查了一下 concat 的原生实现，大概是下面这个样子：

```js
// 创建结果数组
var arr3 = []
// 添加 arr1
for(var i = 0; i < arr1Length; i++){
  arr3[i] = arr1[i]
}
// 添加 arr2
for(var i = 0; i < arr2Length; i++){
  arr3[arr1Length + i] = arr2[i]
}
```

然后 push 的原生实现：

```js
for(var i = 0; i < arr2Length; i++){
  arr1[arr1Length + i] = arr2[i]
}
```

很明显，`concat` 比 `.push` 慢这么多的主要原因就是它创建了一个新数组，还需要额外将第一个数组的元素复制给这个新数组。。。

之前也想过 concat 的性能会比 push 稍微差一点，但是没想到这个性能差距居然有上千倍左右，真是大意了。


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
