---
title: 如何控制Web资源加载的优先级？
category: Web
tag: 
- 浏览器策略
- 最新提案
date: 2021-11-28	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。




## 浏览器解析资源的优先级


当浏览器开始解析网页，并开始下载图片、`Script` 以及 `CSS` 等资源的时候，浏览器会为每个资源分配一个代表资源下载优先级的 `fetch priority` 标志。

而资源下载的顺序就取决于这个优先级标志，这个优先级标志的计算逻辑会受很多因素的影响：

- `Script`、`CSS`、`Font`、`Image` 等不同的资源类型会有不同的优先级。
- 在 `HTML文档` 中引用资源的位置或顺序也会影响资源的优先级（例如在 `viewport` 中的图片资源可能具有高优先级，而在 `<link>` 标签中加载的，阻塞渲染的 `CSS` 则拥有更高的优先级）。
- 有 `preload` 属性的资源有助于浏览器更快地发现资源、其实也是影响资源加载的优先级。
- `Script` 的 `async` 或 `defer` 属性都会影响它的优先级。

综合考虑这些因素，下面是现在大多数的资源在 `Chrome` 中的优先级和排序方式：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1fc9dfa2406241bc920dd94ab675f2c6~tplv-k3u1fbpfcp-zoom-1.image)

浏览器按照资源被发现的顺序下载具有相同计算优先级的资源。你可以在 `DevTools Network` 下看到分配给不同资源的优先级：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/243e4037adb144b484ad6c575d180415~tplv-k3u1fbpfcp-zoom-1.image)

> 尽管浏览器很擅长这件事情，但是并不是所有情况下默认的下载优先级都是最佳的。

## 为什么你需要 Priority Hints  ？

知道了浏览器为资源分配下载优先级的方式，我们就可以根据实际的业务场景去适当做一些调整：

- 根据期望的资源的下载顺序放置资源标签，例如 `<script>`和 `<link>`，具有相同优先级的资源通常按照它们被放置的顺序加载。
- 使用 `preload` 属性提前下载必要的资源，特别是对于浏览器早期不易发现的资源。
- 使用 `async` 或 `defer` 下载非首屏不需要阻塞的资源。
- 延迟加载一些首屏内容，以便浏览器可以将可用的网络带宽用于更重要的首屏资源。

这些技术可以让我们更好的控制浏览器的优先级计算，从而提高网页的 `Core Web Vitals` 性能指标。例如，我们将网页关键的背景图像进行预加载，可以改进最大内容绘制指标 ( `LCP` )。

但是，以上的几个技术也不能足以让我们在所有场景都能把优先级控制的很好，比如下面的几个场景：

- 网站现在有多个首屏图像，但它们并具有相同的优先级，比如在轮播图中只有第一张图需要更高的优先级。
- 将 `<script>` 声明为 `async` 或 `defer` 可以告诉浏览器异步加载它们。但是，根据我们上面的分析，这些 `<script>` 也被分配了 “低” 优先级。但是你可能希望在确保浏览器异步下载它们的同时提高它们的优先级，尤其是一些对用户体验至关重要脚本。
- 浏览器为 `JavaScript fetch API` 异步获取资源或数据分配了高优先级，但是某些场景下你可能不希望以高优先级请求所有资源。
- 浏览器为 `CSS`、`Font` 分配了同样的高优先级，但是并不是所有 `CSS` 和 `Font` 资源都是一样重要的，你可能需要更具体的指定它们的优先级。

所以，浏览器又给我们提供了一个能更好控制资源优先级加载的功能：`Priority Hints`。


## importance 属性

你可以使用一个 `importance` 属性来更细力度的控制资源加载的优先级，包括 `link、img、script` 和 `iframe` 这些标签。

`importance` 属性可以指定三个值：

- `high`：你认为该资源具有高优先级，并希望浏览器对其进行优先级排序。
- `low`：你认为该资源的优先级较低，并希望浏览器降低其优先级。
- `auto`：采用浏览器的默认优先级。

```html
<!-- We don't want a high priority for this above-the-fold image -->
<img src="/images/in_viewport_but_not_important.svg" importance="low" alt="I'm an unimportant image!">

<!-- We want to initiate an early fetch for a resource, but also deprioritize it -->
<link rel="preload" href="/js/script.js" as="script" importance="low">

<script>
  fetch('https://example.com/', {importance: 'low'}).then(data => {
    // Trigger a low priority fetch
  });
</script>

<!-- The third-party contents of this iframe can load with a low priority -->
<iframe src="https://example.com" width="600" height="400" importance="low"></iframe>
```

## 实际应用

#### 提升 LCP 图像的优先级

现在，你拥有了更灵活的优先级配置，你可以用它去提升你网页的 `Core Web Vitals` 。

比如，在 `Google Flights` 这个网页中，影响它 `LCP` 指标的主要原因是它的背景图片，现在我们用 `importance` 属性提升它加载的优先级：

```html
<img src="lcp-image.jpg" importance="high">
```

可以发现，网页的 `LCP` 从 `2.6s` 提高到 `1.9s`：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ccbe1704ed614e0ea8259993b2acb4e8~tplv-k3u1fbpfcp-zoom-1.image)


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/314d03c58e62499286a1e58613b72be6~tplv-k3u1fbpfcp-zoom-1.image)

#### 降低首屏图片的优先级

使用 `importance` 属性降低可能不重要的首屏图片的优先级，比如轮播图中后面的图片：

```html
<ul class="carousel">
  <img src="img/carousel-1.jpg" importance="high">
  <img src="img/carousel-2.jpg" importance="low">
  <img src="img/carousel-3.jpg" importance="low">
  <img src="img/carousel-4.jpg" importance="low">
</ul>
```

#### 降低预加载资源的优先级

想要阻止预加载资源和其他关键资源的竞争，可以降低其优先级：

```html
<!-- Lower priority only for non-critical preloaded scripts -->
<link rel="preload" as="script" href="critical-script.js">
<link rel="preload" href="/js/script.js" as="script" importance="low">

<!-- Preload CSS and hero images without blocking other resources -->
<link rel="preload" as="style" href="theme.css" importance="low" onload="this.rel=stylesheet">
```


#### 脚本的优先级


如果页面上有一些必要的交互脚本，但不需要阻塞其他资源，你可以把它们标记为具有高优先级，同时异步加载它们：

```html
<script src="async_but_important.js" async importance="high"></script>
```
如果脚本依赖于特定的 `DOM` 节点，则它们不能被标记为异步加载。但是如果它们不是首屏渲染必备的，你可以降低它们的优先级：

```html
<script src="blocking_but_unimportant.js" importance="low"></script>
```

#### fetch

浏览器默认会以高优先级执行 fetch 请求，你可以降低不太关键的数据请求的优先级：

```js

// Important validation data (high by default)
let authenticate = await fetch('/user');

// Less important content data (suggested low)
let suggestedContent = await fetch('/content/suggested', {importance: 'low'});
```

## 开始试用

你可以在 `Chrome` 的设置中打开 `Experimental Web Platform Features ` 就可以试用这一特性啦。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/41a5957dfff840f685ac2050f5c38c79~tplv-k3u1fbpfcp-zoom-1.image)




## 参考
- https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/1.5/Changing_the_priority_of_HTTP_requests
- https://developer.chrome.com/blog/new-in-chrome-96/#pri-hints
- https://web.dev/priority-hints/



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
