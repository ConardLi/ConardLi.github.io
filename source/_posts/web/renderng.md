---
title: Chrome 的下一代 Web 渲染架构：RenderingNG 
category: Web
tag: 
- 浏览器原理
date: 2021-07-14		
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


近日，`Chris Harrelson`（Blink 渲染引擎负责人）在 `Chrome` 官方博客介绍了 `Chrome` 下一代渲染架构：RenderingNG。

2021 年， `RenderingNG` 的架构的设计、构建和交付过程即将完成，它是真正的下一代渲染架构，大大超越了之前的架构。`RenderingNG` 已经开发了至少八年，它为下一代快速、流畅、可靠、响应迅速和交互式的 Web 带来了无限潜力。它为开发人员可以依赖的所有 Web 渲染引擎定义了一个新的最低标准。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06b9f92998854416a894341b00f18dda~tplv-k3u1fbpfcp-zoom-1.image)

## 核心特点

- 具有跨平台、设备、操作系统的核心功能。
- 具有可预测和可靠的性能。
- 最大化使用硬件功能（CPU，GPU，屏幕分辨率，刷新率，低级栅格化 API）。
- 只执行显示可见内容所需的工作。
- 内置对通用视觉设计、动画和交互设计模式的支持。
- 为开发者提供 API 轻松管理渲染开销。
- 为开发者插件提供渲染管线扩展点。
- 其他优化项：HTML，CSS，2D Canvas，3D canvas，images，video 和 fonts。


`Gecko` 和 `Webkit` 也实现了这些博客文章中描述的大部分架构特性，某些甚至在 `Chromium` 之前就已经实现了。

这很棒！虽然任何一个浏览器变得更快、更可靠都值得庆祝，但我们的最终目标是提高所有浏览器的基线，让开发人员可以依赖它，这是之前任何一个渲染引擎没有想过的。


## 理念

`RenderingNG` 的理念是首先实现可靠性的结果，然后是可扩展的性能，最后是可扩展性。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2568dc5c05f3421eb40c437c4e1cf1b7~tplv-k3u1fbpfcp-zoom-1.image)

## 稳定性

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f327390c4f0948bf83c75d5f77dca2d6~tplv-k3u1fbpfcp-zoom-1.image)

满足丰富复杂的用户体验的前提就是提供一个坚如磐石的平台。所有的核心功能和基础都必须正常工作，并且能在长时间的情况下稳定运行。同样重要的是，这些功能组合得很好并且没有奇怪的边界错误（这里有内涵到😅）。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f7b91dc5244437d885b498088dd1bc5~tplv-k3u1fbpfcp-zoom-1.image)

因此，稳定性是 RenderingNG 最重要的部分。

为了说明稳定性的重要性，`Chromium` 团队花了过去八年的大部分时间来解决这个问题。首先，他们建立了对系统的深入了解 —— 从漏洞报告中学习并修复这些弱点，进行综合测试，了解站点的性能需求和 `Chromium` 性能局限性。然后他们仔细地设计并推出了关键的设计模式和数据结构。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20e3cf0cc26341e68fd86d0979bd2fac~tplv-k3u1fbpfcp-zoom-1.image)

### 测试和指标

在过去的 8 年中，`Chromium` 团队添加了数以万计的单元、性能和集成测试。此外，他们还开发了全面的指标来衡量 Chromium 渲染在本地测试、性能基准测试以及在真实网站上使用真实用户和设备的许多方面的表现。

但是无论 `RenderingNG`（或其他浏览器的渲染引擎，就此而言）有多么出色，如果浏览器之间存在大量错误或行为差异，那么我们做 Web 开发的仍然不容易。为了解决这个问题，他们还最大限度地使用了 Web 平台测试。这些测试中的每一个都验证了所有浏览器都应该通过的网络平台的使用模式。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/946a96eaabaf4332a4a679ba20021578~tplv-k3u1fbpfcp-zoom-1.image)

## 可扩展的性能

在速度、内存和功耗方面实现出色的性能是 `RenderingNG` 的下一个最重要的方面。我们希望与所有网站的交互顺畅且响应迅速，同时又不牺牲设备的稳定性。

但 `RenderingNG` 不只是想要性能，更想要可扩展的性能 — 一种在低端和高端机器上以及跨操作系统平台上都可靠地运行良好的架构。

这称之为向上扩展 — 利用硬件设备可以实现的所有功能，然后向下扩展 — 在需要时最大限度地提高效率并减少对系统的需求。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f9b802826c6d458ba6399b1b2d5f9f70~tplv-k3u1fbpfcp-zoom-1.image)


为此， `RenderingNG` 需要最大限度地利用缓存、性能隔离和 GPU 硬件加速。


### 缓存

在动态、交互式 UI 平台（如 Web）中，缓存是显着提高性能的唯一最重要的方式。浏览器中最著名的缓存类型是 HTTP 缓存，但渲染也有很多缓存。滚动最重要的缓存是缓存的 GPU 纹理和显示列表，它允许非常快的滚动，同时最大限度地减少电池消耗并在各种设备上运行良好。

缓存有助于滚动的电池寿命和动画帧率，但更重要的是它可以解除与主线程的性能隔离。


### 性能隔离


在现代计算机上，你永远不必担心后台应用程序会减慢你正在使用的程序的速度。这是因为抢占式多任务处理，这反过来又是一种性能隔离形式：确保独立任务不会相互减慢速度。

在 Web 上，性能隔离的最佳示例就是滚动。即使在具有大量慢速的 `JavaScript` 的网站上，滚动也可以非常流畅，因为它运行在不同的线程上，而不必依赖于 `JavaScript` 和渲染线程。 `RenderingNG` 会确保每一个可能的滚动都是线程化的，通过缓存，远远超出显示列表到更复杂的情况。示例包括表示固定和粘性定位元素的代码、被动事件监听器和高质量的文本渲染。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/894e5d45d5bc451da7c3ec08623e1f5b~tplv-k3u1fbpfcp-zoom-1.image)

### GPU加速

GPU 显着加快了生成像素和绘制到屏幕的速度 — 在很多情况下，每个像素都可以与其他每个像素并行绘制，从而大大提高了速度。`RenderingNG` 的一个关键组件是 `GPU` 光栅和随处绘制。这在所有平台和所有设备上使用 `GPU` 来超加速 `Web` 内容的渲染和动画。这在低端设备或非常高端的设备上非常重要，这些设备通常比设备的其他部分具有更强大的 GPU。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d16813b71d446aa97d805e3442c918c~tplv-k3u1fbpfcp-zoom-1.image)


## 可扩展性

`RenderingNG` 已经有了非常好的稳定性和可扩展的性能，另外它还对开发非常友好，它可以很好的帮助我们扩展 `HTML`、`CSS` 和 `Canvas` 的内置部分，并且不会牺牲任何性能和稳定性。

这包括用于响应式设计、渐进式渲染、平滑度和响应性以及线程渲染的的高级用例的内置 `API` 和暴露于 `JavaScript` 的 `API`。


- `content-visibility`: 允许站点轻松避免屏幕外内容的渲染，并为当前未显示的单页应用提供视图缓存渲染。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/61fb56f9d21b4adbac34a8ac3670b37d~tplv-k3u1fbpfcp-zoom-1.image)

- `OffscreenCanvas`: 允许画布渲染（2D 画布 API 和 WebGL）在其自己的线程上运行，大大提升性能。这个项目也是 Web 的另一个重要里程碑 — 它是第一个允许 `JavaScript`（或 `WebAssembly`）从多个线程渲染单个网页文档的 Web API。

- `Container queries`: 新的响应式布局架构

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5b9c710bb84d440cb6ae0354f7a7c345~tplv-k3u1fbpfcp-zoom-1.image)

- `Origin isolation`: 允许站点在 iframe 之间选择更多的性能隔离。


- `Off-main-thread paint worklets`: 通过在合成器线程上运行的代码，为开发人员提供了一种扩展元素绘制方式的方法。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32c1711345174e4b8fb534a64cc2dc79~tplv-k3u1fbpfcp-zoom-1.image)


除了显式的 `Web API` 之外，`RenderingNG` 还为我们提供了几个非常重要的自动功能，这对所有站点是默认生效的：

- 站点隔离：将跨域 iframe 放在不同的 CPU 进程中，以获得更好的安全性和性能隔离。
- Vulkan、D3D12 和 Metal：利用比 OpenGL 更有效地使用 GPU 的低级 API。
- 更多合成动画：SVG，背景颜色。



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
