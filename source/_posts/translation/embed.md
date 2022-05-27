---
title: Web 第三方嵌入的最佳实践
category: 翻译
tag: 
- 最佳实践
date: 2021-11-09
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

今天给大家带来一篇 Web 第三方嵌入相关的实践文章，在我们的网页中嵌入一个第三方网页是再常见不过的需求了，比如一些视频播放、在线地图或者广告等等。

第三方的内容可能会通过多种方式影响我们页面的性能。比如它可能会阻塞渲染、与我们页面上其他的资源争夺网络带宽、第三方网页的嵌入也可能在加载时导致布局偏移，进而影响我们网页的 `Core Web Vitals` 指标。

本文主要讨论的就是在网页加载第三方嵌入时可以使用的一些最佳实践。里面的一些实例大多是海外的一些网站，不过里面的一些思路还是很值得借鉴的。

## 什么是嵌入

第三方嵌入可能是你网站上显示的任何内容，首先它满足下面俩条件：

- 不是你写的
- 由第三方服务器提供


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73241c598f0946c780354a0268af7e31~tplv-k3u1fbpfcp-zoom-1.image)


一般嵌入经常用于以下的情况：

- 与体育、新闻、娱乐和时尚相关的网站会嵌入一些第三方视频
- 将社交媒体（比如 Twitter ）卡片嵌入到自己的网页中
- 一些餐厅、公园或者活动页面通常需要嵌入在线地图

一般我们都会通过 `<iframe>` 来嵌入一个三方网页。

## 第三方嵌入的性能影响

大部分流行的第三方嵌入网页都会加载超过 `100 KB` 的 `JavaScript`，有时甚至高达 `2 MB`，它们需要更多的时间加载并且占用了主进程。

`Lighthouse` 或者 `Chrome DevTools` 这些性能监控工具都可以帮我们衡量第三方嵌入对性能的影响。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24ea63e24fa743fd843b6ed709cf2c97~tplv-k3u1fbpfcp-zoom-1.image)


虽然第三方嵌入给我们带来了很大的性能影响，我们还是要用，所以我们需要一些优化方案来尽可能的减少它们的影响。

## 脚本排序

在设计良好的网页中，我们页面的主 JS 肯定是要首先加载的，第三方嵌入的资源一定要放在后面。

> 例如，新闻页面上的新闻肯定要在嵌入的 `Twitter` 卡片或广告之前加载。

对第三方嵌入资源的加载请求会阻断我们主 JS 的加载，所以第三方脚本标签的位置很重要。

将第三方脚本标签放在网页的主要资源之后，并使用 `async` 或 `defer` 属性异步加载它们。

```html
<head>
   <title>Order of Things</title>
   <link rel="stylesheet" media="screen" href="/assets/application.css">
   <script src="index.js"></script>
   <script src="https://example.com/3p-library.js" async></script>
</head>
```

## 懒加载

一般的第三方嵌入都不是我们网页的主要功能，所以它们不一定是首屏可见的，在这种情况下，我们可能需要等用户向下滚动到这部分功能的时候再加载它。

根据不同的嵌入要求和类型，我们可能需要以下几种方式的懒加载：

#### 原生 `<iframe>` 的懒加载

使用 `<iframe>` 嵌入第三方网页，我们可以使用浏览器的原生懒加载支持，这回使浏览器在用户即将滚动到该标签之前才加载它。

```html
<iframe src="https://example.com"
       loading="lazy"
       width="600"
       height="400">
</iframe>
```

不过需要注意的是，`Chrome77` 以上才支持懒加载。

`loading` 属性支持设置下面的值：

- lazy: 表示浏览器应该延迟加载 iframe。浏览器会直到 iframe 接近可视区域时才加载它。
- eager：立即加载 iframe。
- auto: 由浏览器决定是否延迟加载这个iframe。

#### lazysizes 

由于原生的懒加载的兼容性问题，不同的浏览器可能会有不一样的行为表现。如果你希望更好的控制懒加载的距离阈值，或者希望跨浏览器提供一致的延迟加载体验，可以使用 `lazysizes` 这库。

**https://github.com/aFarkas/lazysizes**

`lazysizes` 是一个快速、高性能并且对 `SEO` 友好的懒加载库，适用于图片和 `iframe`，你可以像下面这样使用，实现 `YouTube` 视频的嵌入：

```html
<script src="lazysizes.min.js" async></script>

<iframe data-src="https://www.youtube.com/embed/aKydtOXW8mI"
   width="560" height="315"
   class="lazyload"
   title="YouTube video player"
   frameborder="0"
   allow="accelerometer; autoplay; clipboard-write; 
        encrypted-media; gyroscope; picture-in-picture"
   allowfullscreen>
</iframe>
```
> lazysizes 使用的就是浏览器的 Intersection Observer API 来检测元素的可见性。

#### 在 Facebook 中使用 data-lazy

`Facebook` 提供了可以嵌入的不同类型的`社交插件`，包括帖子、评论、视频等，插件都包括一个 `data-lazy` 属性，


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf769cfd18954a9d8d66ba69ed271e12~tplv-k3u1fbpfcp-zoom-1.image)


## 用封面替换嵌入

虽然交互式的嵌入为页面增加了可交互性和灵活性，但很多用户可能都不会和它们进行交互。例如，并不是每个浏览餐厅页面的用户都会单击、展开、滚动嵌入的地图。同样，并非每个访问电信服务商页面的用户都会和聊天机器人聊天。在这些情况下，你可以通过在特定位置仅显示外观来完全避免加载或者延迟加载嵌入网页。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e98f26922edd466f899491b040d5fa3c~tplv-k3u1fbpfcp-zoom-1.image)

是的，这个封面看起来是个嵌入的网页，但是实际上它不能进行任何交互，就是能看看罢了，但是在某些场景下也能解决一些问题，我们来实际看几个例子

#### 使用静态图像

就拿刚刚地图的例子来讲，其实地图的可交互性不是必备的，用户完全可以跳转到在线地图网站去做更多的操作，所以这时候你完全可以只展示一个地图截图。

你可以使用  `DevTools` 的节点屏幕截图工具来截取 `iframe` 的屏幕截图：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb2ddb160fe84d18921f4ca084e63e8e~tplv-k3u1fbpfcp-zoom-1.image)

> DevTools 截图的格式是 Webp。

#### 使用动态图像

这个技术可以让你在运行时生成与交互式嵌入类似的动态图像，比如下面几个工具：


`Maps Static API`：`Google Maps Static API` 服务可以根据标准的 `HTTP` 请求中包含的 `URL` 参数生成地图，并且可以将地图作为可以显示在网页上的图像返回。

下面是一个例子，`img` 被包裹在一个 `a` 标签里面，单击一下就可以跳转到 `Google Map`：

```html
<a href="https://www.google.com/maps/place/Albany,+NY/">
<img src="https://maps.googleapis.com/maps/api/staticmap?center=Albany,+NY&zoom=13&scale=1&size=600x300&maptype=roadmap&format=png&visual_refresh=true" alt="Google Map of Albany, NY">
</a>
```

`Twitter 截图`：类似于地图截图，你可以通过 `Tweetpik` 这样的工具来生成一个动态 `Twitter` 图片。`Tweetpik API` 通过接收一个推文的 `URL` 就可以返回带有其内容的图片。API 还支持一些参数来自定义图像的背景、颜色、边框和尺寸等等。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c548637a8a7b45fcaa0dfac8b8df6d86~tplv-k3u1fbpfcp-zoom-1.image)

#### 点击加载

我们可以默认情况下使用静态或者动态的图片来作为封面，当用户点击那块区域的时候我们再去动态加载嵌入的网页，我们来看几个例子：

- YouTube 封面

`Lite-youtube-embed` 是一个专门为 `YouTube` 生成封面的库，它生成的图片看起来就像一个真正的视频播放器，当我们去点击它，它才会去真正加载播放器：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c84238d6d3d48588330e0f29fb27f60~tplv-k3u1fbpfcp-zoom-1.image)


```html
<lite-youtube videoid="ogfYd705cRs" playlabel="Play: Keynote (Google I/O '18)"></lite-youtube>
```
另外还有一些做类似事情的库：`lite-youtube、lite-vimeo-embed、lite-vimeo`。


- 聊天组件封面

`React-live-chat-loader` 会加载一个看起来像聊天嵌入的按钮，但是它实际上不是嵌入的组件，而是一个图片，当用户悬停或者点击这个按钮的时候，才会实际使用聊天组件去替换它。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f707f73868c472d8f2815157ac2383a~tplv-k3u1fbpfcp-zoom-1.image)

## 布局稳定性

虽然动态加载嵌入内容可以提高页面的加载性能，但有时会导致页面内容意外移动，这称为布局偏移。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04afeacf207742db9f96359cf36ed54f~tplv-k3u1fbpfcp-zoom-1.image)

`CLS` 是 `Core Web Vitals` 之一，它会测量在页面的整个生命周期中发生的每个意外的样式移动的所有单独布局更改得分的总和。

为了避免发生太大的布局偏移，我们可以通过指定 `iframe` 的 `width` 和 `height` 属性或通过为将加载第三方嵌入的静态图片设置固定大小。

```html
<iframe src="https://www.youtube.com/embed/aKydtOXW8mI" width="560" height="315"> 
</iframe>
```

#### Layout Shift Terminator

由于第三方嵌入通常会忽略它们呈现的最终内容的尺寸（宽度、高度），所以它们可能会导致页面上的布局发生重大的变化。如果不使用 `DevTools` 在各种不同的视口尺寸下手动检查最终尺寸，这个问题可能很难解决。

我们可以通过 `Layout Shift Terminator` 这个工具来减少这种布局偏移，他可以帮助我们自动生成各种流行的视口的媒体查询和容器查询：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c355b194ee0c470c91d532a9b84b5060~tplv-k3u1fbpfcp-zoom-1.image)

本文译自：**https://web.dev/embed-best-practices/** 希望文章的内容可以帮到你。

如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
