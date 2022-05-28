---
title: 用几行原生JS就可以实现丝滑的元素过渡效果！
category: 样式和效果
tag: 
- 浏览器策略
- 最新提案
- 用户体验
- 样式和效果
date: 2021-11-26	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

今天来给大家讲一个网页体验优化的小技巧。

大家可以看下下面这个应用的页面切换体验，是不是很丝滑～

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34525f11c38a4dd59c52c0624933a80e~tplv-k3u1fbpfcp-zoom-1.image)

做过体验优化的朋友应该都清楚，如果用原生的 CSS 或者 JS 动画去实现，想要实现出类似的效果，不会特别简单，而且也要考虑性能问题。

不过，最近有一个新的提案，可以帮助我们快速实现这样的效果。

`Shared Element Transitions` 是一个新的 `script` 提案，它可以帮助我们在 `SPA` 或者 `MPA` 页面中实现元素过渡效果。

> 本项提案的灵感来自于 `Material Design`（设计届的天花板） 中的过渡效果。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8624b69cb7da4a96a787f49fffaaa904~tplv-k3u1fbpfcp-zoom-1.image)


## 试用

这个 API 从  `Chrome 92` 版本中开始试用，你可以通过在 `Chrome` 的 `about:flags` 中搜索 `#document-transition` 来开启这项试用。

你可以测试下 `document` 上是否存在 `documentTransition` 来验证 API 是否支持。

```js
if ('documentTransition' in document) {
  // Feature supported
}
```

这个提案主要分为两部分，第一个是完整的根过渡，第二个是指定一组共享元素进行过渡。

## 简单的根过渡

顾名思义，跟过渡的意思就是转换整个页面的根节点，下面我们来看一个例子：

```js
// When the user clicks on a link/button:
async function navigateToSettingsPage() {
  // Capture the current state.
  await document.documentTransition.prepare({
    rootTransition: 'cover-left',
  });

  // This is a function within the web app that updates the DOM:
  updateDOMForSettingsPage();

  // Start the transition.
  await document.documentTransition.start();
  // Transition complete!
}
```

执行一次根过渡，只需要上面几行代码：

- 调用 `documentTransition.prepare()` 函数捕获当前页面的视觉状态
- 调用一个更新 DOM 的函数（比如改变页面的背景色），上面例子中用的是 `updateDOMForSettingsPage()` 函数
- 调用 `documentTransition.start()` 函数执行转换

另外，你还可以通过 `rootTransition` 属性来改变过渡的方向。

然后，你就拥有了一个非常丝滑的过渡效果。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9067d3c203fb478f90ba7a35c56ad2d9~tplv-k3u1fbpfcp-zoom-1.image)


你可以打开下面这个网站来看一个演示示例（注意一定要打开上面提到的实验 flag，不然没有效果）：

> https://root-transitions-demo.glitch.me/

不过，这个过渡也是有一些局限性的，比如下面几点：

- `过渡的页面会失去动画效果`：过渡的页面会被捕获为单个帧，如果被过渡的元素上有一些 gif 或者 CSS 动画，可能会失效。
- `转换对整个文档生效`：你还不能将过渡限制为某些内部 UI。
- `对过渡控制有限`：现在还没法控制过渡的长度、透明度或者其他属性，未来可能会支持。


注意，你一旦调用了 `documentTransition.prepare()` ，后面做的所有 DOM 的更改都不会立即生效，浏览器会进行延迟渲染，直到后面的 `documentTransition.start()` 被调用。


## 共享元素过渡

你还可以指定一组特定的元素进行过渡，可以参考下面的效果（加了过渡状态的 preact 官网）：

**https://preact-with-nav-transitions.netlify.app/**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b664c4ba79624cf496b1a35fccd7d4bb~tplv-k3u1fbpfcp-zoom-1.image)

我们可以通过指定 `sharedElements` 这个属性来实现共享元素过渡：

```js
// When the user clicks on a link/button:
async function navigateToSettingsPage() {
  // Capture and visually freeze the current state.
  await document.documentTransition.prepare({
    rootTransition: 'cover-up',
    sharedElements: [element1, element2, element3],
  });
  // This is a function within the web app:
  updateDOMForSettingsPage();
  // Start the transition.
  await document.documentTransition.start({
    sharedElements: [element1, element4, element5],
  });
  // Transition complete!
}
```


在这种情况下，指定的 `sharedElements` 将会独立于页面的其他部分进行动画处理。

## 未来


- `多页应用`：现在这个 API 还无法实现页面到页面的转换，documentTransition 正在努力支持中，类似下面的实现：

```js
document.documentTransition.startOnNavigation(
  url,
  sharedElements: selectorList
);
```

- `多页跨域应用`：跨域页面间的过渡转换，这个更难实现，而且还需要考虑一些安全限制，这个也是未来此 API 要支持的能力。


大家有更多的问题可以到 Github（`https://github.com/WICG/shared-element-transitions`） 进行讨论。


我觉得这个功能还是非常 nice 的，希望它尽早结束试用，在稳定版和我们见面。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/80ecdb2e2bc44386ac70232256b9e1ff~tplv-k3u1fbpfcp-zoom-1.image)


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
