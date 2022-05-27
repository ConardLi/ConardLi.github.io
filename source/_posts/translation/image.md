---
title: Web图像组件设计的最佳实践
category: 翻译
tag: 
- 最佳实践
- 组件设计
date: 2021-12-15
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


网页中的图片处理一直是 `Web` 开发的一大挑战，今天跟大家来一起看看 `Next.js` 中的 `Image` 组件，我觉得这个组件的设计有很多值得借鉴的地方，可以作为图片组件设计的最佳实践。英文原文在这：https://web.dev/image-component/

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/257c7f50c77a4f2bb062d92b11241b51~tplv-k3u1fbpfcp-zoom-1.image)

本文中会涉及一些网页性能指标，没有了解过的同学可以先看一下我这篇文章：

[解读新一代 Web 性能体验和质量指标](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490403&idx=1&sn=9d408c8264fda966e3254ece8d663601&chksm=c2e2ee48f595675ef574b1e39ed72ea1e032ee0465e255da7a2dfafc7217521b205d3ef5120b&token=402055249&lang=zh_CN#rd)


## 网页中的图像带来的主要问题和优化方向

网页中的图片不仅会影响网页性能，还有可能会影响业务，一个网页中加载的图片数量是用户访问网站的转化率的第二大影响因素。

作为网页最佳实践检查中的的一部分，`Lighthouse` 列出了很多种优化图片加载的建议，比如下面这几点：


### 未指定大小的图片会降低 CLS 

未指定宽高的图片会导致布局的不稳定并导致布局偏移指标 (`CLS`) 恶化。在 `img` 元素上设置 `width` 和 `height` 属性可以优化这个问题，例如：

```html
<img src="flower.jpg" width="360" height="240">
```


宽度和高度应该设置的更接近图片本身的宽高比。如果差的太多可能导致图像看起来失真。

使用 CSS 新增的 `aspect-ratio` 属性可以帮你更好的响应式的调整图片大小。

### 图片太大可能影响 LCP


图像的文件大小越大，下载所需的时间就越长。网页中的大图可能是触发最大内容绘制指标 ( `LCP` )的最重要元素。作为网页关键内容的一部分并且需要很长时间下载的图片肯定会降低网页的 `LCP`。

在很多情况下，开发者可以通过更好的压缩或者使用响应式图像来减小图片大小。`<img>`元素的 `srcset` 和 `sizes` 属性可以指定不同大小的图片文件。然后浏览器可以根据屏幕大小和分辨率选择性加载。

### 糟糕的图像压缩可能影响 LCP 

`AVIF` 或 `WebP` 等现代图片格式可以提供比 `JPEG` 和 `PNG` 等常用格式更好的压缩能力。在某些情况下，对于相同质量的图片，更好的压缩可以将文件大小减少 `25%` 到 `50%`。这种体积上的减少可以让下载速度更快，数据消耗更少。

### 加载不必要的图片可能影响 LCP 


加载网页时，用户在首屏看不到的图片可以延迟加载，这样它们就不会对 `LCP` 造成影响。

## 图片优化的主要挑战

在上面我们已经把主要问题和优化方向都列出来了，事实上，由于一些问题，并不是所有的网站都能作出这些优化，比如：

- `优先事项`：Web 开发者可能通常更倾向于关注代码、`JavaScript` 和数据优化。大部分前端可能不知道图片的主要问题以及如何优化它们。
- `开箱即用的解决方案`：即使我们意识到了这些问题，但是对于我们的研发框架可能缺少一些开箱即用的解决方案，这会大大提升优化成本。
- `动态加载图片`：除了我们开发的时候引入的一些图片，可能还有一部分是来自于用户上传。在图片来源是动态的情况下，定义此类图片的大小可能比较困难。
- `浏览器支持`：一些现代图片格式如 `AVIF` 和 `WebP` 的兼容性往往比较差，我们还需要在不支持它们的浏览器上进行特殊处理。
- `懒加载的复杂性`：实现懒加载有很多钟方法，那你至少哪种方法是最适合你的网页的吗，不同设备上不同的视口尺寸也会将问题复杂化。

## Image组件的最佳实践


在过去的一年里，我们使用 `Next.js` 框架设计和实现了 `Image组件`。它可以替换 `Next.js` 中的 `<img>` 元素，这是一个使用示例：


```js
// Before with <img> element:
function Logo() {
  return <img src="/code秘密花园.jpg" alt="logo" height="200" width="100" />
}

// After with image component:
import Image from 'next/image'

function Logo() {
  return <Image src="/logo.jpg" alt="logo" height="200" width="100" />
}
```

组件提供了一组丰富的功能和原则来解决与图片相关的问题。它还允许开发者根据各种图片要求对其进行自定义的选项配置。

### 防止布局变化

就像上面提到的，未指定宽高的图片会导致布局的不稳定并导致布局偏移指标 (`CLS`) 恶化。使用 `Next.js` `Image` 组件时，开发者必须使用 `width` 和 `height` 属性指定图片大小，以防止任何布局偏移。如果大小未知，开发者必须指定 `layout=fill` 提供一个位于容器内的未知大小图片。


```js
// Image component with width and height specified
<Image src="/logo.jpg" alt="logo" height="200" width="100" />

// Image component with layout specified
<Image src="/hero.jpg" layout="fill" objectFit="cover" alt="hero" />

// Image component with image import
import Image from 'next/image'
import logo from './code秘密花园.png'

function Logo() {
  return <Image src={logo} alt="logo" />
}
```

### 响应式

要使图像跨设备自适应，开发者必须在 `<img>` 元素中设置 `srcset` 和 `sizes` 属性。如果使用 `Image` 组件就可以不用做这项工作。 `Next.js` 中的 `Image` 组件可以有一个全局的图片设置，根据布局模式可以将它们应用于 `Image` 组件的所有实例，有下面三个属性：

- `deviceSizes` 属性：此属性可用于基于应用程序用户基础的通用设备一次性配置断点。
- `imageSizes property`：这也是一个可配置的属性，用于获取与设备大小断点对应的图像大小。
- `layout` 每个组件中的属性：用于指示如何使用每个图像的 `deviceSizes`和 `imageSizes` 属性。布局模式支持的值是 `fixed，fill，intrinsic` 和 `responsive`。


当使用 `fill` 或 `responsive` 布局模式加载图片时，`Next.js` 会根据请求页面的设备的大小识别要提供的图片，并适当地设置 `srcset` 和 `sizes`。

下面的例子展示了怎么使用布局模式来控制不同屏幕上的图像大小。

`Layout = Intrinsic`：缩小以适应容器在较小视口上的宽度。在较大的视口上放大时不会超过图像的固有尺寸，容器宽度为 `100%`


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01b303662bf94fa9b71fed71196d726c~tplv-k3u1fbpfcp-zoom-1.image)

`Layout = Fixed`：不管在什么设备上，宽度和高度是固定的。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/638747029bfd45fe9d4e805de5667d76~tplv-k3u1fbpfcp-zoom-1.image)

`Layout = Responsive`：根据容器在不同视口上的宽度缩小或放大，保持宽高比。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6806d5c8edad445abcd2c95f83da8931~tplv-k3u1fbpfcp-zoom-1.image)

`Layout = Fill`：宽高自动填充父容器

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d97df846a172474884003ee49c013ff3~tplv-k3u1fbpfcp-zoom-1.image)

### 懒加载

`Image` 组件默认提供了一个内置的、高性能的延迟加载解决方案。`<img>` 元素有一些默认的懒加载方案，但它们都有很多缺点，使用起来也比较麻烦，我们可能会采用以下懒加载方法之一：

- 指定 `loading` 属性：实现简单，但兼容性差
- 使用 `Intersection Observer API`：设计一个自定义的懒加载解决方案需要深思熟虑的设计和实现，不是所有开发都有时间和精力做这种设计。
- 第三方懒加载库：你需要一定的时间对这些库进行选择和评估。

在 `Next.js` 的 `Image` 组件中，图片默认的设置就是 `Lazy` 的。懒加载是使用 `Intersection Observer` 实现的，它的兼容性很好。我们不需要做任何额外的事情来启用它，但我们可以根据具体的场景去选择禁用。


### 预加载

上面提到了，图像的文件大小越大，下载所需的时间就越长。网页中的大图可能是触发最大内容绘制指标 ( `LCP` )的最重要元素，对一些大图进行预加载可能是个好主意。

使用 `<img>` 元素时，`HTML` 标题中可能包含预加载提示：


```html
<link rel="preload" as="image" href="important.png">
```

不管使用什么框架，一个设计良好的图像组件应该提供一种方法来调整图像的加载顺序。在 `Next.js` 的 `Image` 组件中，开发人员可以使用 `priority` 属性指示适合预加载的图像。

```html
<Image src="/code秘密花园.jpg" alt="ConardLi" height="400" width="200" priority />
```

### 推荐CDN托管图片

`Next.js` 的 `Image` 默认使用一种加载器架构来处理图片，你可以自定义配置图片的 `CDN` 前缀。

```js
module.exports = {
  images: {
    loader: 'imgix',
    path: 'https://ImgApp/imgix.net',
  },
}
```

通过这种配置，开发者可以在图片加载时中使用相对路径，框架会将相对路径与 `CDN` 路径连接起来生成绝对 `URL`。目前支持一些主流的图像 `CDN`，如 `Imgix、Cloudinary` 和 `Akamai` 。这种架构通过 `loader` 为应用支持使用自定义 `CDN` 提供商。

### 渐进式加载


所谓渐进式加载，就是在实际图像加载时先显示质量较差的占位符图，它可以与懒加载结合使用，从而提高了感知性能并增强用户体验。


`Next.js` `Image` 组件支持通过 `placeholder` 属性对图像进行渐进式加载，用于在加载实际图像时显示低质量或模糊的图像。

## 效果

下面是 `leboncoin` 使用了 `Image` 组件后的优化效果：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/db4aad47e7cc434e9f148075a288b786~tplv-k3u1fbpfcp-zoom-1.image)


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b3cdfacbe619441686a8ab77f099b29c~tplv-k3u1fbpfcp-zoom-1.image)



`LCP` 从 `2.4s` 下降到 `1.7s`，为页面下载的总图像资源大小从 `663kB` 增加到了 `326kB`（懒加载的图片大小约为 `100kB`）。




如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
