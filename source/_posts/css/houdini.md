---
title: 使用 Houdini 扩展 CSS 的跨浏览器绘制能力
category: 样式和效果
tag: 
- 样式和效果
- CSS
date: 2021-08-18
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



`CSS Houdini` 是一个总称，它描述了一系列底层的浏览器 `API`，这些 `API` 为开发者提供了对编写的样式更强大的能力。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e794138ac004dab9b94009074bf05f8~tplv-k3u1fbpfcp-zoom-1.image)

`Houdini` 通过 `Typed Object Model` 启用更多的语义化 CSS 。开发者可以通过属性和值  API 定义具有语法、默认值和继承的高级 CSS 自定义属性。

> Typed Object Model：https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API/Guide

它还引入了绘制、布局和动画工作集，通过使作者更容易地与浏览器渲染引擎的样式和布局过程挂钩，从而开辟了一个充满可能性的世界。

## Houdini worklets 

`Houdini worklets` 是一个运行在主线程之外的浏览器指令，可以在需要时调用。`Worklets` 使你能够编写模块化 `CSS` 来完成特定的需求，并且只需要一行 `JavaScript` 即可导入和注册。与 `CSS` 样式的 `Service Worker` 非常相似，`Houdini` 工作集已注册到你的应用程序，并且一旦注册就可以在你的 `CSS` 中按名称使用。

写入工作集文件 注册工作集模块 ( `CSS.paintWorklet.addModule(workletURL)`) 使用工作集 ( `background: paint(confetti)`)

## CSS Painting API

`CSS Painting API` 就是这样一个 `worklet` 的例子，它允许开发者定义类似画布的自定义绘画函数，这些函数可以直接在 `CSS` 中用作背景、边框、遮罩等等。你可以在自己的用户界面中使用`CSS Paint`。

例如，你可以编写自己的 `Paint` 工作集，或使用现有的已发布工作集，而不是等待浏览器实现有角度的边框功能。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d183f40623624e5bb46547011001b18a~tplv-k3u1fbpfcp-zoom-1.image)

```css
.angled {
  --corner-radius: 15 0 0 0;
  --paint-color: #6200ee;
  --stroke-weight: 0;

  /* Mask every angled button with fill mode */
  -webkit-mask: paint(angled-corners, filled);
}

.outline {
  --stroke-weight: 1;

  /* Paint outline */
  border-image: paint(angled-corners, outlined) 0 fill !important;
}
```
`CSS Painting API` 目前是支持最好的 `Houdini API` 之一，这个规范也是 `W3C` 的候选推荐。它目前在所有基于 `Chromium` 的浏览器中启用，在 `Safari` 中部分支持，并且正在考虑用于 `Firefox`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fbb74aefbee64949987b06cb4655e94b~tplv-k3u1fbpfcp-zoom-1.image)


即使没有完整的浏览器支持，你仍然可以使用 `Houdini Paint API` 发挥你的创意，使用 `CSS Paint Polyfill` ，你的样式可以在所有现代浏览器中都有效。为了展示一些独特的实现，以及提供资源和工作集库，`Houdini` 官方团队开发了 `houdini.how`。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/95c5416e092642b39b6dd27158b5e1f0~tplv-k3u1fbpfcp-zoom-1.image)

> `Houdini.how` 是 `Houdini` 工作集和资源的库和参考。它提供了你需要了解的有关 `CSS Houdini` 的一切：浏览器支持、其各种 API 的概述、使用信息、附加资源和实时绘制工作集示例。`Houdini.how` 上的每个示例都由 `CSS Paint API` 支持，这意味着它们都适用于所有现代浏览器。


## 使用 Houdini


`Houdini worklets` 必须在本地通过服务器运行，或者在生产环境中通过 `HTTPS` 运行。为了使用 `Houdini worklets`，你需要在本地安装它或使用像 `unpkg` CDN 来加载资源。然后，你需要在本地注册工作集。

有几种方法可以将 `Houdini.how` 中的工作集在你自己的 `Web` 项目中使用。它们可以通过 `CDN` 以原型能力加载，也可以使用 `npm` 模块自行管理工作集。无论哪种方式，你还需要加载 `CSS Paint Polyfill` 以确保它们是跨浏览器兼容的。


### 1. 使用 CDN 进行原型设计#

从 `unpkg` 加载时，可以直接链接到 `worklet.js` 文件，无需在本地安装 `worklet`。`Unpkg` 将解析 `worklet.js` 作为主脚本，或者你可以自己指定。

```js
CSS.paintWorklet.addModule("https://unpkg.com/<package-name>");
```

要选择性地注册自定义属性，请同时加载 `properties.js` 文件。

```js
<script src="https://unpkg.com/<package-name>/properties.js"></script>
```

加载 ` CSS Paint Polyfill`：

```js
<script src="https://unpkg.com/css-paint-polyfill"></script>
```
### 2. 通过 NPM 安装

```
npm install <package-name>
npm install css-paint-polyfill
```
导入此包不会自动注入绘制工作集。要安装工作集，你需要生成一个解析为包的 `worklet.js` 的 `URL`，并注册它：

```js
CSS.paintWorklet.addModule(..file-path/worklet.js)
```


以下是如何在现代打包器中使用带有绘制 `polyfill` 的 `Houdini` 的示例：

```js
import 'css-paint-polyfill';
import '<package-name>/properties.js'; // optionally register properties
import workletURL from 'url:<package-name>/worklet.js';

CSS.paintWorklet.addModule(workletURL);
```


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。








