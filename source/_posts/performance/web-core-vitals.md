---
title: 解读新一代 Web 性能体验指标
category: 性能和体验
tag: 
- 性能优化
- 指标
date: 2020-05-25
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


衡量一个 `Web` 页面的体验和质量一直有非常多的工具和指标 ... 每次我们去关注这些指标的时候都会非常痛苦，因为这些指标真的是又多又难理解，测量这些指标的工具也非常多。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f21f04562d04b13905ca899da7a34c1~tplv-k3u1fbpfcp-zoom-1.image)

当看到最近发布的 `Chrome 83` 中又增加了几个性能指标的时候我头都大了...

然而不要着急，这些指标就是为了聚焦关注度和降低理解成本的，下面我们就来具体看一下，新增加的 `Core Web Vitals` 到底是什么东西？

## 如何衡量用户体验质量？

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3bb70ff1b87343dd9bcf520c88431ffc~tplv-k3u1fbpfcp-zoom-1.image)

优化用户体验的质量一直都是是每个 `Web` 站点长期成功的关键，衡量用户体验的质量有很多方面。虽然用户体验的某些方面是需要基于特定于站点和上下文的，但是所有站点仍然有一组共同的指标——`Core Web Vitals`，这些指标包括加载体验、交互性和页面内容的视觉稳定性，他们构成了 `2020` 年核心 `Web` 健康指标的基础。

多年来，Google 提供了很多工具：(`Lighthouse, Chrome DevTools, PageSpeed Insights, Search Console's Speed Report`) 来衡量和报告性能。一些开发人员是使用这些工具的专家，而大部分其他人则发现大量的工具和衡量标准都很难学习和使用。

网站开发者不应该为了理解他们交付给用户的体验的质量指标而成为性能专家。`Web Vitals` 计划的目的就是简化场景，降低学习成本，并帮助站点关注最重要的指标，即 `Core Web Vitals`。

## Core Web Vitals

`Core Web Vitals` 是应用于所有 `Web` 页面的 `Web Vitals` 的子集，所有的站点开发者都应该关注一下，他们将在所有谷歌提供的性能测试工具中进行显示。每个 `Core Web Vitals` 代表用户体验的一个不同方面，在该领域是可衡量的，并反映了以用户为中心的关键结果的真实体验。

网页核心的性能指标应该是随着时间的推移而不断演变的。当前 `2020` 年主要关注用户体验的三个方面——加载、交互性和视觉稳定性:

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1595fa1021148df99f054350ae61afa~tplv-k3u1fbpfcp-zoom-1.image)

-   `Largest Contentful Paint (LCP)`: 衡量加载体验：为了提供良好的用户体验， `LCP` 应该在页面首次开始加载后的 `2.5` 秒内发生。
-   `First Input Delay (FID)`: 衡量可交互性，为了提供良好的用户体验，页面的 `FID` 应当小于 100毫秒。
-   `Cumulative Layout Shift (CLS)`:衡量视觉稳定性，为了提供良好的用户体验，页面的CLS应保持小于 0.1。

下面我们来详细介绍这三种性能指标：

## LCP

### 加载体验的衡量

衡量 `Web` 页主要内容的加载速度是众多开发者一直在关注的一个点，而且可衡量的指标非常多。

比如最早的 `load`、`DOMContentLoaded` 事件，用这两个事件来衡量页面加载速度是非常糟糕的，因为它们不一定与用户在屏幕上看到的内容相对应。

以用户为中心的更新性能指标（例如`First Contentful Paint（FCP）`）它只能捕捉加载体验的最开始。如果页面最开始显示的是一个 `loading` 动画，那这个指标就很难关注了。

后来，业界开始建议使用比如 `First Meaningful Paint (FMP)` 和 `Speed Index (SI)`（都可以在 `Lighthouse` 中获取）等性能指标来帮助捕获初次渲染后的更多加载体验，但是这些指标非常复杂，难以解释，而且误报率也比较高。

### 什么是 LCP

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9aae14747a85415ea37cff2cca31246a~tplv-k3u1fbpfcp-zoom-1.image)

`Largest Contentful Paint (LCP)` 用于衡量标准报告视口内可见的最大内容元素的渲染时间。为了提供良好的用户体验，网站应努力在开始加载页面的前 `2.5` 秒内进行 `最大内容渲染` 。

相比 `FCP` ，这个指标就非常有价值了，因为这个值是根据页面加载渲染不断变化的，如果页面有一个 `lodaing` 动画，然后才渲染出具体内容，那么这个指标计算出来的就是具体内容的加载速度，而非 `lodaing` 动画的加载速度。

### LCP 考虑哪些元素

`LCP` 目前并不会计算所有元素，因为这样会使这个指标变得非常复杂，它现在只关注下面的元素：

-   <img> 元素
-   `<image>`元素内的`<svg>`元素
-   <video> 元素
-   通过 `url()` 函数加载背景图片的元素
-   包含文本节点或其他内联文本元素子级的块级元素。

> 为了在开始时保持简单，将元素限制到这个有限的集合是有意的。随着研究的深入，将来可能会添加更多的元素。

### 如何计算 LCP ?

页面上最大的元素即绘制面积最大的元素，所谓绘制面积可以理解为每个元素在屏幕上的 “占地面积”，如果元素延伸到屏幕外，或者元素被裁切了一部分，被裁切的部分不算入在内，只有真正显示在屏幕里的才算数。

图片元素的面积计算方式稍微有点不同，因为可以通过 `CSS` 将图片扩大或缩小显示，也就是说，图片有两个面积：“渲染面积”与“真实面积”。在 `LCP` 的计算中，图片的绘制面积将获取较小的数值。例如：当“渲染面积”小于“真实面积”时，“绘制面积”为“渲染面积”，反之亦然。

页面在加载过程中，是线性的，元素是一个一个渲染到屏幕上的，而不是一瞬间全渲染到屏幕上，所以“渲染面积”最大的元素随时在发生变化。

如果元素被删除，LCP算法将不再考虑该元素，如果被删除的元素刚好是 “绘制面积” 最大的元素，则使用新的 “绘制面积” 最大的元素创建一个新的性能条目。

该过程将持续到用户第一次滚动页面或第一次用户输入（鼠标点击，键盘按键等），也就是说，一旦用户与页面开始产生交互，则停止报告新的性能指标。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b5c9869656a742e5866e4f2ba436aaff~tplv-k3u1fbpfcp-zoom-1.image)

在以上两个时间轴中，最大的元素随内容加载而变化。在第一个示例中，新内容被添加到 `DOM` 中，并且更改了最大的元素。在第二个示例中，布局发生更改，以前最大的内容从视口中删除。通常情况下，延迟加载的内容要大于页面上已存在的内容。

### 改善 LCP

LCP较差的最常见原因是：

-   服务器响应时间慢
-   阻断渲染的 `Javascript` 和 `CSS`
-   资源加载时间慢
-   客户端渲染

所以我们从上面的角度去考虑改善 `LCP`：

#### 优化服务器

这个很好理解，浏览器从服务器接收内容所需的时间越长，则在屏幕上呈现任何内容所花费的时间就越长。更快的服务器响应时间可以直接改善包括 `LCP` 在内的所有页面加载指标。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d6ea894c4db407e8846c7eb5db3bde4~tplv-k3u1fbpfcp-zoom-1.image)

衡量服务器相应时间有一个专门的指标：首字节相应时间（`TTFB`）是最初的网络请求被发起到从服务器接收到第一个字节这段时间，它包含了 `TCP` 连接时间，发送 `HTTP` 请求时间和获得响应消息第一个字节的时间。你可以尝试在下面几个方便优化 `TTFB` ：

-   缓存 `HTML` 离线页面，缓存页面资源，减少浏览器对资源的请求。
-   尽量减小资源阻断渲染：`CSS` 和 `JavaScript` 压缩、合并、级联、内联等等
-   对图片进行优化。转化图片的格式为 `JPG` 或者 `WEBP` 等等的格式，降低图片的大小，以加快请求的速度。
-   对 `HTML` 重写、压缩空格、去除注释等。减少 `HTML` 大小，加快速度。
-   使用 `preconnect` 尽快与服务器建立链接、使用 `dns-prefetch` 尽快进行 `DNS` 查找。
-   使用 `CDN` 加快请求速度

#### 优化阻断渲染的资源

`JavaScript` 和 `CSS` 都是会阻断页面渲染的资源，需要尽可能的对 `CSS` 和 `JavaScript` 文件进行压缩、延迟加载首屏无需使用的 `JavaScript`、内联关键的 `CSS` 等来减小阻断时间。

#### 优化资源加载时间

刚才我们上面提到的这些资源，如果在首屏进行渲染，则加载这些元素所花费的时间将直接影响 `LCP` 。

-   `<img>` 元素
-   `<image>`元素内的`<svg>`元素
-   `<video>` 元素
-   通过 `url()` 函数加载背景图片的元素
-   包含文本节点或其他内联文本元素子级的块级元素。

你可以使用下面的手段进行优化：

-   对图片进行优化。转化图片的格式为 `JPG` 或者 `WEBP` 等等的格式，降低图片的大小。
-   对重要的资源进行预加载，比如为 `style` 标签添加 `rel="preload"` 属性
-   使用 `Gzip` 和 `Brotli` 压缩页面资源，降低传输时间
-   使用 `service worker` 缓存资源

#### 服务端渲染

使用服务端渲染可以确保首先在服务器上呈现页面内容，可以有效改善 `LCP`，但是相比客户端渲染的缺点是会加大页面从而影响 `TTFB`、服务端渲染需要等待所有 js 执行完毕后才能相应用户输入，这会使交互体验变差。

## FID

### 第一印象

我们都知道留下一个好的第一印象是多么重要。在网络上，一个好的第一印象可以决定一个人是不是可以成为一个网站的忠实的用户，或者是离开以后再也不会回来。问题是，什么能给人留下好印象，你如何衡量你可能给用户留下什么样的印象?

在网络上，第一印象可以有很多种不同的形式——我们对网站的设计和视觉吸引力有第一印象，对其速度和响应能力也有第一印象。

开发者们使用 `First Contentful Paint（FCP）` 可以衡量对网站加载速度对第一印象 。但是，网站可以在屏幕上绘制像素的速度只是一部分，同样重要的是用户尝试与这些像素进行交互时你的网站的响应速度！

### 什么是 FID

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bec7c98438454ab5b793e4eae27bc441~tplv-k3u1fbpfcp-zoom-1.image)

`FID（ First Input Delay）` 即记录用户和页面进行首次交互操作所花费的时间 `。FID` 指标影响用户对页面交互性和响应性的第一印象。为了提供良好的用户体验，站点应努力使首次输入延迟小于 `100` 毫秒。

`FID` 发生在 `FCP` 和 `TTI` 之间，因为这个阶段虽然页面已经显示出部分内容，但尚不具备完全的可交互性。这个阶段用户和页面交互，往往会有较大延迟。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e86fa04b5aa4e5c9ccf5994549479ef~tplv-k3u1fbpfcp-zoom-1.image)

如上图所示，浏览器接收到用户输入操作时，主线程正在忙于执行一个耗时比较长的任务，只有当这个任务执行完成后，浏览器才能响应用户的输入操作。它必须等待的时间就此页面上该用户的 `FID` 值。

例如，以下所有 `HTML` 元素都需要在响应用户交互之前等待主线程上正在进行的任务完成：

-   文本输入框，复选框和单选按钮（`<input>，<textarea>`）
-   选择下拉菜单（`<select>`）
-   链接（`<a>`）

### 如何提高 FID

以下几个方面是提高 `FID` 的重要指标：

#### 减少 `JavaScript` 执行时间

同上面改善 `LCP` 的方法：

-   缩小并压缩 `JavaScript` 文件

-   延迟加载首屏不需要的 `JavaScript`

-   尽量减少未使用的 `polyfill`

    #### 分解耗时任务

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/797b175934b54611bec0a02068ff3b01~tplv-k3u1fbpfcp-zoom-1.image)

    上面提到一个较长的耗时任务是影响 `FID` 的重要指标，任何阻塞主线程 `50` 毫秒或更长时间的代码段都可以称为“长任务”，我们可以将长的耗时任务拆分为较小的异步任务。

    #### 使用 Web Worker

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf8448be9b4d4da0a0e86838ba02e34e~tplv-k3u1fbpfcp-zoom-1.image)

    主线程阻塞是输入延迟的主要原因之一。`Web Workers` 可以让你在与主执行线程分离的后台线程上运行 `JavaScript`，这样做的好处是可以在一个单独的线程中执行费时的处理任务，从而允许主（通常是UI）线程运行而不被阻塞。将非 `UI` 操作移至单独的工作线程可以减少主线程的阻塞时间，从而改善 `FID` 。

    ## CLS

    ### 视觉稳定性

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e76ed06b7a7400a8de7b3a931133e26~tplv-k3u1fbpfcp-zoom-1.image)

    您是否曾经在访问一个 `Web` 页面时发生下面的情况？在阅读文章的同时文字突然移动了、你突然找不到你阅读的位置了、点按钮的时候按钮被移动到了其他地方，导致你点了其他东西？

    页面内容的意外移动通常是由于异步加载资源或将 `DOM` 元素动态添加到现有内容上方的页面而发生的。罪魁祸首可能是尺寸未知的图像或视频，渲染后比其后备更大或更小的字体，或者是动态调整自身大小的第三方广告或小部件。

    `Cumulative Layout Shift (CLS)` 可通过测量实际用户发生的频率来帮助您解决此问题。

    ### 什么是 CLS？

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7a9be97ba6ea4c5e9c68d292a99af113~tplv-k3u1fbpfcp-zoom-1.image)

    `CLS` 会测量在页面的整个生命周期中发生的每个意外的样式移动的所有单独布局更改得分的总和。布局的移动可能发生在可见元素从一帧到下一帧改变位置的任何时候。为了提供良好的用户体验，网站应努力使 `CLS` 分数小于 `0.1` 。

    ### 如何计算 CLS?

    **布局偏移分值**

    为了计算布局的偏移值，浏览器会查看两个渲染帧之间的视口大小和视口中不稳定元素的移动。布局偏移分是该移动的两个指标的乘积:影响分数和距离分数。

    ```
    layout shift score = impact fraction * distance fraction
    ```

    **影响分数**

    前一帧和当前帧的所有不稳定元素的可见区域的并集（占视口总面积的一部分）是当前帧的影响分数。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35c8b38af39d416a83d43f2dba03ec14~tplv-k3u1fbpfcp-zoom-1.image)

    在上图中，有一个元素在一帧中占据了视口的一半。然后，在下一帧中，元素下移视口高度的`25％`。红色的虚线矩形表示两个帧中元素的可见区域的并集，在这种情况下，其为总视口的`75％`，因此其影响分数为 `0.75`。

    **距离分数**

    布局偏移值方程的另一部分测量不稳定元素相对于视口移动的距离。距离分数是任何不稳定元素在框架中移动的最大距离(水平或垂直)除以视口的最大尺寸(宽度或高度，以较大的为准)。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0635716de35f4ceaa1573c18f6fbaac6~tplv-k3u1fbpfcp-zoom-1.image)

    在上面的例子中，最大的视口尺寸是高度，并且不稳定元素移动了视口高度的`25%`，这使得距离分数为`0.25`。

    因此，在此示例中，影响分数为`0.75`，距离分数为`0.25`，因此版式位移分数为`0.75 * 0.25 = 0.1875`。

    ### 如何改善 CLS?

    #### 不要使用无尺寸元素

    图像和视频等元素上始终需要包括 `width` 和 `height` 尺寸属性，现代浏览器会根据图像的 `width` 和 `height` 属性设置图像的默认长宽比，知道纵横比后，浏览器就可以为元素计算和保留足够的空间。

    或者，使用 `aspect-ratio` 也可以提前指定宽高比：

    ```
    img {
        aspect-ratio: attr(width) / attr(height);
    }
    ```

    那响应式的图片呢？可以使用 `srcset` 定义图像，使浏览器可以在图像之间进行选择，以及每个图像的大小。

    ```
    <img 
        width="1000" 
        height="1000"
        src="puppy-1000.jpg"
        srcset="puppy-1000.jpg 1000w,
                puppy-2000.jpg 2000w,
                puppy-3000.jpg 3000w"
        alt="ConardLi"
    />
    ```

    -   永远不要在现有内容之上插入内容，除非是响应用户交互。这确保了预期的布局变化。
    -   宁可转换动画，也不要转换触发布局变化的属性的动画。以一种提供从一个状态到另一个状态的上下文和连续性的方式动画转换。

    #### 提前给广告位预留空间

    很多页面广告都是动态插入的，所以一定要提前为广告位预留一定空间。

    #### 警惕字体变化

    字体通常是大文件，需要一段时间才能加载，一些浏览器直到下载完字体后才呈现文本

    `font-display: swap` 告诉浏览器默认使用系统字体进行渲染，当自定义字体下载完成之后再进行替换。

    ```
    @font-face {
      font-family: 'Pacifico';
      font-style: normal;
      font-weight: 400;
      src: local('Pacifico Regular'), local('Pacifico-Regular'), url(https://fonts.gstatic.com/xxx.woff2) format('woff2');
      font-display: swap;
    }
    ```

    另外，你可以使用 `<link rel="preload">` 更早的加载字体文件。

    ## 获取 Core Web Vitals

    Google 认为，`Core Web Vitals` 对于所有网络体验都至关重要。因此，它致力于在其工具中显示这些指标，下面是现有工具中指标的支持情况：

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e529a840e9f94cee87d581b2d0138ae0~tplv-k3u1fbpfcp-zoom-1.image)

    > 尚未支持这些指标的工具都将在最近得到支持。

    ### web-vitals

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e5364d1e7fa469ebcae3e03df3b4836~tplv-k3u1fbpfcp-zoom-1.image)

    现在你可以使用标准的 `Web API` 在 `JavaScript` 中测量每个指标。`Google` 提供了一个 `npm` 包：`web-vitals`，这个库提供了非常简单的 `API`，测量每个指标就像调用一个普通函数一样简单：

    ```
    npm install web-vitals
    ```

    每个测量函数都接收一个 `report` 回调函数作为参数，回调函数将在测量完成后触发，另外，对于像 `LCP` 和 `CLS` 这样的指标是不断变化的，所以它们的回调函数可能会多次触发，如果你想获取在这期间获取每次变化的数值，你可以指定第二个参数 `reportAllChanges`，否则回调函数只有在最终测量完成后触发一次。

    ```
    import {getCLS, getFID, getLCP} from 'web-vitals';
    ​
    getCLS(console.log, true);
    getFID(console.log); // Does not take a `reportAllChanges` param.
    getLCP(console.log, true);
    ```

    这些变化的指标如果触发多次的话可能会多次发送到你的服务器，所以回调函数中提供了下面三个参数：

    -   `name`：指标名称
    -   `id`：本地分析的id
    -   `delta`：当前值和上次获取值的差值

    因此你只需要每次上报 `delta` (当前值和上次获取值的差值)，而不需要报告新值。然后在服务器可以通过计算所有id对应值的和来获取最终结果。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aa5c81364ac74280b74692d1a4049d93~tplv-k3u1fbpfcp-zoom-1.image)

    ```
    import {getCLS, getFID, getLCP} from 'web-vitals';
    ​
    function logDelta({name, id, delta}) {
      console.log(`${name} matching ID ${id} changed by ${delta}`);
    }
    ​
    getCLS(logDelta, true);
    getFID(logDelta);
    getLCP(logDelta, true);
    ```

    你可以很好的结合 `Google Analytics` 来记录你的上报指标：

    ```
    import {getCLS, getFID, getLCP} from 'web-vitals';
    ​
    function sendToGoogleAnalytics({name, delta, id}) {
      ga('send', 'event', {
        eventCategory: 'Web Vitals',
        eventAction: name,
        eventValue: Math.round(name === 'CLS' ? delta * 1000 : delta),
        eventLabel: id,
        nonInteraction: true,
      });
    }
    ​
    getCLS(sendToGoogleAnalytics);
    getFID(sendToGoogleAnalytics);
    getLCP(sendToGoogleAnalytics);
    ```

    ### 使用 Chrome 插件

    如果你不想在程序中计算，还可以使用 `Chrome` 插件这样更方便的方式，`Google` 也提供了一个新的插件 `web-vitals-extension` 来帮助我们获取这些指标：

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f1b1626d075463d8c1013dedcf8ea21~tplv-k3u1fbpfcp-zoom-1.image)

    这个插件非常简洁，只有 `CLS、FID、LCP` 这三个核心指标，这样可以大大聚焦我们的关注度，降低理解成本。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b04358dcada4462c8047321fdd277890~tplv-k3u1fbpfcp-zoom-1.image)

    徽章的颜色可以告诉你页面有没有通过默认设定的阈值：

    -   灰色：插件不支持或者被禁用
    -   绿色：通过所有指标
    -   红色：一个或多个指标不达标

    ## 小结

    最后，想在浏览器中使用上面的工具和指标？快升级一下 `Chrome 83` 版本吧～，更多 `Chrome 83` 的更新可以点击 [Chrome 83 发布，支持直接读写本地文件！新的跨域策略!](https://mp.weixin.qq.com/s?__biz=Mzg2NDAzMjE5NQ==&mid=2247485716&idx=1&sn=cb8ecf78cd25666e7baadd358ce6f8d6&scene=21#wechat_redirect) 查看。

    ## 参考

    -   <https://web.dev/vitals/>
    -   <https://web.dev/lcp/>
    -   <https://web.dev/fid/>
    -   <https://web.dev/cls/>
    -   <https://github.com/GoogleChrome/web-vitals#api>
    -   <https://github.com/GoogleChrome/web-vitals-extension>
    -   <https://developers.google.com/web/updates/2020/05/nic83#coop>



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。

