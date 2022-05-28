---
title: 解读 State of JS 2021
category: 技术视野
tag: 
- 技术视野
- JavaScript
- 报告解读
date: 2022-02-20	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


拖了这么久，JS 生态圈最权威的调查报告 `state-of-js` 终于是出来了 ... 

还记得，我为大家解读 2021 年的 `state-of-css`，是在去年的 12 月份 ...

[看完了 2021 CSS 年度报告，我学到了啥？](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247491460&idx=1&sn=08759537606f44b55a29ad0c35c0ce1b&chksm=c2e2eaaff59563b90e450cec8878c8c0173e6785b32c1499bbf7131435674e00dd2989cd53bc&token=260804687&lang=zh_CN#rd)

今天，我来带大家看看 `2021` 年 `state-of-js`  的调查结果：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a2aefc1b1b94d44b861d66b7e02dc20~tplv-k3u1fbpfcp-zoom-1.image)

## 速览

下面是我挑出来的几个比较重点的，我们先来速览一下：

- 可选链操作符使用率已经高达 `85%`。
- 空值合并操作符（`??`）使用率提升了 `21%`。
- 将近 `50%` 的受访者在使用 `Shadow DOM API`。
- `esbuild` 是满意度调查中同比增长最大的工具。
- `Vite` 满意度高达 `97%`、Glup 的满意度只有 `26%` 。
- 当前有 `5.6%` 的受访者正在使用 `Deno`。
- 一些老牌 JS 库 `Axios、Lodash` 和 `Moment` 仍然是最受欢迎的。
- `TypeScript` 是迄今为止最常见的 `JavaScript` “替代风格”，`Elm` 位居第二。

## JS特性 - 语言

### Proxy


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ed369d9bd9d4414aab7b5cc88a5666f0~tplv-k3u1fbpfcp-zoom-1.image)

`Proxy` 在各种框架和库中使用的越来越多了（特别是 `Vue.js 3.0` 开始使用后），所以了解到它的同学也越来越多，但是实际使用率没有太大变化。

### Promise.allSettled()

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bef00642772d4a908a6465814ac0a4d2~tplv-k3u1fbpfcp-zoom-1.image)

`Promise.allSettled()` 我还没用过，用法类似于 `Promise.all`，区别是：它所有给定的 `promise` 不管是 `fulfilled` 还是 `rejected` 状态，只要全部返回后它就会返回。在你不关心所有的异步任务是不是都必须成功的时候可能会用到它。

### Dynamic Import


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c5f584d8239b46dbb264e25a3a0eed28~tplv-k3u1fbpfcp-zoom-1.image)

动态导入：只有 `15%` 的人还不知道它，接近 `50%` 的小伙伴都用过了，一般会在懒加载的时候用到。


### Nullish Coalescing


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bcfa99a9fe49476796cc12abc903ad7a~tplv-k3u1fbpfcp-zoom-1.image)

空值合并运算符：这玩意这么多人都在用吗？用过的小伙伴可以在评论区说一下，我平时用的比较多的还是 `||` 或者 `&&`。

空值合并操作符（`??`），会在左侧的操作数为 `null` 或者 `undefined` 时，返回其右侧操作数，否则返回左侧操作数。

和 `||` 的区别是， `||` 会在左侧是 `0` 的时候也返回右侧，而 `??` 会返回 `0`。

```js
const baz = 0 ?? 42;
console.log(baz); // 0

const conard = 0 ||  42;
console.log(conard); // 42
```

### Optional Chaining


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73df460c0bb5488580835a39adaf671f~tplv-k3u1fbpfcp-zoom-1.image)

可选链：使用率已经高达 `85%`，非常实用的特性，不多说了。

### Private Fields


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8cadaeb49b0b4086b0bafe3e35c7cd25~tplv-k3u1fbpfcp-zoom-1.image)

私有属性：只有 `20%` 的人用过，我们在类里面定义的属性或方法默认情况下都是公有的，可以通过在前面加个 `#` 来变成私有的（仅在类内部可以访问）。

```js
class ClassWithPrivateField {
  #privateField;
}

class ClassWithPrivateMethod {
  #privateMethod() {
    return 'hello ConardLi';
  }
}
```
### BigInt

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/86d93739d7244243b4fbbc419bf45f6b~tplv-k3u1fbpfcp-zoom-1.image)

`BigInt` 可以解决 `Number` 的精度丢失问题，一般大于 `2^53` 的数我们建议用 `BigInt` 来表示，不过现在使用率还很低，大家通常还是用一些库去处理数字。


### String.prototype.replaceAll()


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6cf7254d25fb4a99b42e6f0e7c0e8cb4~tplv-k3u1fbpfcp-zoom-1.image)

`replaceAll`：可以让我们按照一个正则进行更灵活的字符串替换，第一年参加调查，`Chrome85` 才开始支持的函数，已经有这么多人用过了，真的是一个非常实用的函数：

```js
const regex = /ConardLi/ig;
console.log(p.replaceAll(regex, '棒！'));
```

## JS特性 - 浏览器 API

### Service Workers

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c52e9d5a5834d19bb3294d4e2437718~tplv-k3u1fbpfcp-zoom-1.image)

`Service Worker`：一个服务器与浏览器之间的中间人角色，它可以拦截当前网站所有的请求，我们可以在这中间做很多灵活的判断和处理，只有 `8%` 的人不知道它了，使用率已经高达 `45%` 。

### Intl

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a4238e9ad7ee49a9a73903f053057da5~tplv-k3u1fbpfcp-zoom-1.image)

`Intl` 浏览器给我们提供的一个原生的用来做国际化的 `API`，国际化的需求一般比较复杂，反正我们国际化都是用库，省心很多，这个还没用过。

### Web Audio API

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f58baf59a9da4c72ae54734d2d75dbf5~tplv-k3u1fbpfcp-zoom-1.image)

控制 `Web` 音频的 `API`，只有特定领域的开发者才会用到，变化也不大。

### WebGL


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec0da2bd3791419fa08e2cf54f185cf2~tplv-k3u1fbpfcp-zoom-1.image)


`Web` 图形化的需求越来越复杂多样，`WebGL` 的普及也不可避免。现在大多数人都有过了解，但是使用者还局限在特定领域，今年的增长率已经有了小的变化，相信未来会迎来一个爆发增长～

### Web Animations API

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d74324c3077945f89eaae3c731f11f3f~tplv-k3u1fbpfcp-zoom-1.image)

dom 上的 `animate` 函数，就属于 Web `Animations` API 中的一个，我们日常使用 CSS 实现的一些动画，都可以借助它转换成 `JS` 实现：


```js
document.getElementById("CoonardLi").animate(
  [
    { transform: 'rotate(0) translate3D(-50%, -50%, 0)', color: '#000' },
    { color: '#431236', offset: 0.3 },
  ], {
    duration: 3000,
    iterations: Infinity
  }
);
```

这个应该大家都有了解过吧，一般 `XXX 网页动画实战` 这样的课程和文章都会提到，但是实际开发中实现动画还是用 `CSS` 或者一些 `JS` 库比较多一点。

### WebRTC


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c0a673aaac94ebf8b851f0c8d931a97~tplv-k3u1fbpfcp-zoom-1.image)

`WebRTC` (`Web Real-Time Communications`) 是一项实时通讯技术，可以在网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点的连接，实现视频流和（或）音频流或者其他任意数据的传输。

同样，也是特定领域（如直播）会用到的 `API`，使用者很局限。

### Web Speech API


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ad9b07ff7764affb31805d3b81ee65c~tplv-k3u1fbpfcp-zoom-1.image)

用于处于 `Web` 音频的 `API`，也是特定需求场景才会用到的 API，使用率很低，变化也不大。


### Websocket


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec9ffbda10334225888fc8918200d08e~tplv-k3u1fbpfcp-zoom-1.image)

这个调查里使用率最高的 `Web API` 了，不用多说，只有 `4%` 不知道它是啥东西了 ...

### Shadow DOM


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/544857237f5144d28c2e0026a97790f7~tplv-k3u1fbpfcp-zoom-1.image)

`Shadow DOM` 是 `Web Components ` 里面的一个重要 API：浏览器将模板、样式表、属性、`JavaScript` 码等，封装成一个独立的 `DOM` 元素。外部的设置无法影响到其内部，而内部的设置也不会影响到外部，与浏览器处理原生网页元素（比如`<video>`元素）的方式很像。

`Shadow DOM` 最大的好处有两个，一是可以向用户隐藏细节，直接提供组件，二是可以封装内部样式表，不会影响到外部。

```js
// attachShadow() creates a shadow root.
let shadow = div.attachShadow({ mode: 'open' });
let inner = document.createElement('b');
inner.appendChild(document.createTextNode('Conard Li Hiding in the shadows'));

// shadow root supports the normal appendChild method.
shadow.appendChild(inner);
div.querySelector('b'); // empty
```

这个使用率已经这么高了吗？大家在开发里有用到过吗？


### Page Visibility API

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8822e3adee624fe8ae9f82cb82741b24~tplv-k3u1fbpfcp-zoom-1.image)

页面可见性 API，可以帮助我们检测当前用户是不是还在当前页面，当网页被最小化或者切换到其他 tab 的时候，会触发一个 `visibilitychange` 事件，我们就可以在这个时候去停掉一些耗时的操作来节省资源。

```js
document.addEventListener(visibilityChange, handleVisibilityChange, false);

function handleVisibilityChange() {
  if (document.hidden) {
    // 页面隐藏了
  } else {
    // 页面又活跃了
  }
}
```

一个挺好用的 `API`，兼容性也不错，大家可以用起来～


## JS特性 - 其他技术

### PWA

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4f6c3a1f53b4e8cae29ba8778e6a397~tplv-k3u1fbpfcp-zoom-1.image)

`PWA` 使用率今年涨幅挺大的，也是属于一个比较成熟的技术了。


### WebAssembly


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf90e1dfaccf4d568aa3e89551bdd9bb~tplv-k3u1fbpfcp-zoom-1.image)

`WebAssembly` 有 `88%` 的人都有了解过，但是使用率只有 `15%`，相比去年只增加了 `5%`，它给 Web 开发带来了更多的可能性，相信未来会得到爆发式增长。

## JS 库

### 满意度

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4eec463b062849629da85bdd5d0e366a~tplv-k3u1fbpfcp-zoom-1.image)

这张图挺有意思的，按照 `S、A、B、C` 四个等级的满意度，对比了前端框架、服务端框架、测试库、构建工具、移动和桌面端技术、Monorepo 工具，下面我们来逐个部分看一下。

### 时间变化

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1820bb161c104061b31eb6107f1aa837~tplv-k3u1fbpfcp-zoom-1.image)

紫色代表人气下降，蓝色代表人气上升，向上代表用的人越来越多，向右代表有更多的人想学习它。

怎么看起来大家今年都不太想学东西了呢？哈哈，另外对一些新型的库比如 `Sevelte` 学习欲望还是有增长的。



## 前端框架

### 使用率


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/714c8c84ae4d43bab11e09154fec2575~tplv-k3u1fbpfcp-zoom-1.image)

使用率今年整体都没有太大变化，`React` 依然以 `80%` 的使用率 高居榜首，因为调查的老外比较多，所以 `Angular` 比 `Vue.js` 使用率还要高，不过前者已经是下降趋势了。另外 `Svelte` 的使用率在今年有了 `5%` 的增长。


### 满意率


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e5567289663b4282b84f6435da4e01e5~tplv-k3u1fbpfcp-zoom-1.image)

`Solid.js` 是一匹黑马，今年以 `90%` 的满意率高居榜首，不过它的使用率只有 `3%`，满意度自然也就高一点。

`React` 的满意度已经连续三年下降，来到了第三位，不过在使用率这么高的情况下仍然有 `84%` 的满意度，依然坚挺！

`Ember.js` 应该是崩了，使用率和满意率都连续下降... 没救了。
 

## 后端框架

### 使用率

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4522209fa4ac4bfc8f006d99f6bbde6c~tplv-k3u1fbpfcp-zoom-1.image)

几乎没变化 ... `Express` 依然占据霸主地位，今年新出来的框架不少，像 `Remix` 仅有 `5%` 的使用率。

不过，有点震惊，`Koa` 去哪了？难倒只有中国人用吗？？？


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/82c1c6f10d8b49e1aa9d020893cb6039~tplv-k3u1fbpfcp-zoom-1.image)

### 满意率

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0142618835749a8943d9222ae10d40e~tplv-k3u1fbpfcp-zoom-1.image)

新出来的框架更能满足大家的痛点，所以满意度普遍较高，`SvelteKit` 以 `96%` 的满意度高居榜首。

## 测试框架

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef2e9d9fffb34780895c52f577a82a4b~tplv-k3u1fbpfcp-zoom-1.image)

`Jest` 仍然是最常用的测试框架，`Testing Library` 的使用率增长不多，但是满意度高达 `96%` 。



## 移动端和客户端


### 使用率


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e2248207ee94f929ad821cf680fb19f~tplv-k3u1fbpfcp-zoom-1.image)

今年 `Elctron` 来到了使用率的第一位，不过仍然只有 `36%` 的人用过它，RN 是第二位，二者应该就分别是桌面端和移动端最常用的技术了。


### 满意率


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13d94ec9d1c44f3ebd4c2a26c35320ef~tplv-k3u1fbpfcp-zoom-1.image)

值得注意的是，今年新出的 `Tauri` 占据了榜首，不过它只有 `3%` 的使用率。

`Tauri` 是一个 `Electron` 的替代技术，主要用来解决 `Electron` 包体积和内存消耗过大的问题。

## 构建工具

### 使用率

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/60568dd62fc04aa792eddb41c7fb0777~tplv-k3u1fbpfcp-zoom-1.image)

`webpack` 仍然是使用率最高的框架，`tsc` 依托于 `TypeScript` 的大火来到了第二位，并且还有 `17%` 的增长。另外表现最为亮眼的还是 `Vite`，第一年推出就有了 `30%` 的使用率。


### 满意率

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73c8e0e39a04456fb5d54959694ef704~tplv-k3u1fbpfcp-zoom-1.image)

满意度上今年出现了非常大的分歧，`Snowpack` 的满意度下降了 `24%`，相比 swc 的满意度提升了 `14%`。而 `Vite` 以恐怖的 `98%` 的满意度来到第一位！。`Gulp` 应该是没救了，使用率和满意度都在持续降低。


## Monorepo 工具

### 使用率

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e995715218b142259b64f79e38d8d76c~tplv-k3u1fbpfcp-zoom-1.image)


### 满意度

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d40638f194d94927bb6c510f2c9dac66~tplv-k3u1fbpfcp-zoom-1.image)


`Monorepo` 今年第一次参加调查，表示这种开发方式越来越普及了。但是使用率最高的 `Lerna` 依然只有 `25%`、被吹上天的 `pnpm` 也只有 `13%` 的使用率。

##  其他

### 工具库

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a8317dec6c24485e8b146c5a3a563204~tplv-k3u1fbpfcp-zoom-1.image)

`jQuery` 已经跌到 `11%` 了吗？`Axios` 为啥使用率还这么高，大家不用 `Fetch` 吗？


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/16b9c11c137948d0a0d7204d9293dc5b~tplv-k3u1fbpfcp-zoom-1.image)


### JS 运行时

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13b3befa1a104262a75bb29c4ce4719a~tplv-k3u1fbpfcp-zoom-1.image)

`Node.js` 比 `Browser` 还高？`Deno` 拥有了 `5.6` 的使用率 ...

### 可以编译成 JS 的语言


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8302daef6a054f109287c02e71552598~tplv-k3u1fbpfcp-zoom-1.image)

`TypeScript` 占据绝对霸主地位。

### 评估指标


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33dbee1577fa4aea92a9cc786267a206~tplv-k3u1fbpfcp-zoom-1.image)

在评估是否使用一个库时，考虑最多的因素是什么？

文档 > 开发体验 > 用户体验 > 用户规模 > 社区 > 开发者和团队


## 对 JS 的看法

### JS 生态是不是变化的太快了

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9de09a58b71647b2917f0d411169f3b8~tplv-k3u1fbpfcp-zoom-1.image)

口口声声的喊，学不动了的人都去哪了？为什么同意这个观点的人越来越少了呢？


### JS 的主要痛点

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d579c3ef55e14d8b91b0fd9a6475788b~tplv-k3u1fbpfcp-zoom-1.image)

依赖管理 > 代码架构 > 状态管理 > 调试 > 日期管理 > 编写模块 > 查找包 > 异步

## 颁奖


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/721d27820b524c3187236bd05aefce30~tplv-k3u1fbpfcp-zoom-1.image)

- 空值合并运算符 (`??`) 使用率增长了 `21%`。
- `esbuild` 只有两岁，使用率提升了 `20%`。
- `Vite` 成为最受关注和满意度最高的技术。


## 调查范围


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9dbcfd3899842dc9b7b14c99f535cd3~tplv-k3u1fbpfcp-zoom-1.image)

最后还得吐槽一下，和 `state-of-css` 一样， `state-of-js` 的中国参与者仍然很少 ... 


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e6c2913d3704cf9a5f031fd8c4a7823~tplv-k3u1fbpfcp-zoom-1.image)


还记得当初我在群里丢了调查链接，估计这 `182` 人里有不少是我们的群友～


## 最后

调查报告原文：`https://2021.stateofjs.com/`，对这份报告，大家有什么看法呢？欢迎在评论区和我留言～


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
