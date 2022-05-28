---
title: 关于 Node.js 工作原理的五个误解
category: Node.js
tag: 
- Node.js
date: 2020-03-22
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。





`NodeJS` 诞生于 `2009` 年，由于它使用了 `JavaScript`，在这些年里获得了非常广泛的流行。它是一个用于编写服务器端应用程序的 `JavaScript` 运行时，但是 `"它就是JavaScript"` 这句话并不是 `100%` 正确的。

`JavaScript` 是单线程的，它不是被设计用来实现要求可伸缩性的服务器端上运行的。借助 `Google Chrome` 的高性能 `V8 JavaScript` 引擎，`libuv` 的超酷异步 `I/O` 实现以及其他一些刺激性的补充，`NodeJS` 能够将客户端 `JavaScript` 引入服务器端，从而能够编写超快速的、能够处理成千上万的套接字连接的 `Web JavaScript` 服务器。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0451935946a24d7da7ddd7fdbd73a58e~tplv-k3u1fbpfcp-zoom-1.image)

如上图所示，`NodeJS` 是一个由大量有趣的基础模块构建的大型平台。但是，由于对 `NodeJS` 的这些内部组件的工作方式缺乏了解，因此许多 `NodeJS` 开发人员对 `NodeJS` 的行为做出了错误的理解，并开发了导致严重性能问题以及难以跟踪的错误的应用程序。在本文中，我将描述在许多 `NodeJS` 开发人员中很常见的五个错误理解。

## 误解1 — EventEmitter 和事件循环相关

编写 `NodeJS` 应用程序时会大量使用 `NodeJS EventEmitter`，但是人们误认为 `EventEmitter` 与 `NodeJS Event Loop` 有关，这是不正确的。

`NodeJS` 事件循环是 `NodeJS` 的核心，它为 `NodeJS` 提供了异步的，非阻塞的 `I/O` 机制。它以特定顺序处理来自不同类型的异步事件的完成事件。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7feec1fce69f41af87d66bf40861e581~tplv-k3u1fbpfcp-zoom-1.image)

相反，`NodeJS Event Emitter` 是一个核心的 `NodeJS API`，它允许你将监听器函数附加到一个特定的事件，这个事件一旦触发就会被调用。这种行为看起来像是异步的，因为事件处理程序的调用时间通常比它最初作为事件处理程序注册的时间晚。

`EventEmitter` 实例跟踪与 `EventEmitter` 实例本身内的事件相关联的所有事件和其实例本身。它不会在事件循环队列中调度任何事件。存储此信息的数据结构只是一个普通的老式 `JavaScript` 对象，其中对象属性是事件名称，属性的值是一个侦听器函数或侦听器函数数组。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c0ee6e93b544a4cb820232f565652f0~tplv-k3u1fbpfcp-zoom-1.image)

当在 `EventEmitter` 实例上调用 `emit` 函数时， `emitter` 将按顺序依次同步调所有注册到示例上的回调函数。

看以下代码片段：

```
const EventEmitter = require('events');
​
const myEmitter = new EventEmitter();
​
myEmitter.on('myevent', () => console.log('handler1: myevent was fired!'));
myEmitter.on('myevent', () => console.log('handler2: myevent was fired!'));
myEmitter.on('myevent', () => console.log('handler3: myevent was fired!'));
​
myEmitter.emit('myevent');
console.log('I am the last log line');
```

以上代码段的输出为：

```
handler1: myevent was fired!
handler2: myevent was fired!
handler3: myevent was fired!
I am the last log line
```

由于 `event emitter` 同步执行所有事件处理函数，因此 `I am the last log line` 在调用所有监听函数完成之后才会打印。

## 误解2 - 所有接受回调的函数都是异步的

函数是同步的还是异步的取决于函数在执行期间是否创建异步资源。根据这个定义，如果给你一个函数，你可以确定给定的函数是异步的:

-   调用本地 `JavaScript` / 异步的 `NodeJS` 功能（例如，`setTimeout，setInterval，setImmediate，process.nextTick`，等等）
-   执行异步的 `NodeJS API`（例如，异步函数 `child_process，fs，net`等等） 使用 `PromiseAPI`（包括使用 `async-await` ）
-   从 `C++` 插件调用一个函数，该函数被编写为异步函数（例如`bcrypt`）

接受回调函数作为参数不会使函数异步。但是，通常异步函数的确接受回调作为最后一个参数（除非包装返回一个 `Promise` ）。接受回调并将结果传递给回调的这种模式称为`Continuation Passing Style`。你仍然可以使用 `Continuation Passing Style` 编写同步功能。

```
const sum = (a, b, callback) => {
  callback(a + b);
};
​
sum(1,2, (result) => {
  console.log(result);
});
```

> 同步函数和异步函数在执行期间在如何使用堆栈方面有很大的不同。同步函数在执行的整个过程中都会占用堆栈，方法是禁止其他任何人占用堆栈直到return 为止。相反，异步函数调度一些异步任务并立即返回，因此将自身从堆栈中删除。一旦预定的异步任务完成，将调用提供的任何回调，并且该回调函数将再次占据该堆栈。此时，启动异步任务的函数将不再可用，因为它已经返回。

考虑到以上定义，请尝试确定以下函数是异步还是同步。

```
function writeToMyFile(data, callback) {
    if (!data) {
        callback(newError('No data provided'));
    } else {
        fs.writeFile('myfile.txt', data, callback);
    }
}
```

实际上，上述函数可以是同步的，也可以是异步的，具体取决于传递给的值 `data`。

如果 `data` 为 false， `callback` 则将立即调用，并出现错误。在此执行路径中，该功能是 `100％` 同步的，因为它不执行任何异步任务。

如果 `data` 是 true ，它会将 `data` 写入 `myfile.txt`，将调用回调完成的文件 `I/O` 操作之后。由于异步文件 `I/O` 操作，此执行路径是100％异步的。

强烈建议不要以这种不一致的方式（在此功能同时执行同步和异步操作）编写函数，因为这会使应用程序的行为无法预测。幸运的是，这些不一致可以很容易地修复如下：

```
function writeToMyFile(data, callback) {
    if (!data) {
        process.nextTick(() => callback(newError('No data provided')));
    } else {
        fs.writeFile('myfile.txt', data, callback);
    }
}
```

`process.nextTick` 可以用来延迟 `callback` 函数的调用，从而使执行路径异步。

> 或者，你可以使用 setImmediate 代替 process.nextTick ，这或多或少会产生相同的结果。但是，process.nextTick相对而言，回调具有更高的优先级，从而使其比 setImmediate 更快。

## 误解3 - 所有占用大量CPU的功能都在阻止事件循环

众所周知， `CPU` 密集型操作会阻塞 `Node.js` 事件循环。尽管这句话在一定程度上是正确的，但并不是100％正确，因为有些 `CPU` 密集型函数不会阻塞事件循环。

一般来说，加密操作和压缩操作是受 `CPU` 高度限制的。由于这个原因，某些加密函数和 `zlib` 函数的异步版本以在 `libuv` 线程池上执行计算的方式编写，这样它们就不会阻塞事件循环。其中一些功能是：

-   `crypto.pbkdf2()`
-   `crypto.randomFill()`
-   `crypto.randomBytes()`
-   所有 `zlib` 异步功能

但是，在撰写本文时，还无法使用纯 `JavaScript` 在 `libuv` 线程池上运行CPU密集型操作。但是，你可以编写自己的 `C++` 插件，使你能够安排 `libuv` 线程池上的工作。有某些第三方库（例如 `bcrypt`），它们执行CPU密集型操作并使用 `C++` 插件来实现针对CPU绑定操作的异步API。

## 误解4 - 所有异步操作都在线程池上执行

现代操作系统具有内置的内核支持，可使用事件通知（例如，`Linux` 中的 `epoll` ， `macOS` 中的 `kqueue`，`Windows` 中的 `IOCP` 等）以有效的方式促进网络`I/O` 操作的本机异步。因此，不会在 `libuv` 线程池上执行网络 `I/O`。

但是，当涉及到文件 `I/O` 时，跨操作系统以及同一操作系统中的某些情况存在许多不一致之处。这使得为文件 `I/O` 实现通用的独立于平台的 `API` 极为困难。因此，在 `libuv` 线程池上执行文件系统操作以公开一致的异步 `API`。

`dns.lookup() dns` 模块中的函数是另一个利用 `libuv` 线程池的API。原因是，使用 `dns.lookup()` 功能将域名解析为IP地址是与平台有关的操作，并且此操作不是`100％` 的网络 `I/O`。

## 误解5 - 不应使用NodeJS编写CPU密集型应用程序

这并不是真正的误解，而是关于 `NodeJS` 的一个众所周知的事实，现在由于在 `Node v10.5.0` 中引入 `Worker Threads` 而被淘汰了。尽管它是作为实验性功能引入的，但 `worker_threads` 自 `Node v12 LTS` 起，该模块现已稳定，因此适合在具有CPU密集型操作的生产应用程序中使用。

每个 `Node.js` 工作线程将拥有其自己的v8运行时的副本，事件循环和 `libuv` 线程池。因此，执行阻塞CPU密集型操作的一个工作线程不会影响其他工作线程的事件循环，从而使它们可用于任何传入的工作。

但是，在撰写本文时，IDE对 `Worker Threads` 的支持还不是最大。某些IDE不支持将调试器附加到在主线程以外的其他线程中运行的代码。但是，随着许多开发人员已经开始采用辅助线程进行CPU绑定的操作（例如视频编码等），开发支持将随着时间的推移而成熟。



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
