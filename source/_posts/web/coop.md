---
title: 新的跨域策略：使用COOP、COEP为浏览器创建更安全的环境
category: Web
tag: 
- Web安全
- 浏览器策略
- CORS
date: 2020-07-30
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。




## Web 资源

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b57d3e9e8b3946bc9cbc9aacb58ae8dd~tplv-k3u1fbpfcp-zoom-1.image)

可组合性是 Web 的非常强大的一项能力，你可以轻而易举的加载来自不同来源的资源来增强网页的功能，例如：`font、image、video` 等等。

这些服务非常强大，也很方便，但是这样的策略同样会加大信息泄漏的风险，攻击者可以利用某些手段泄漏你的用户信息。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ee5a4eae21be47e891091407b2427278~tplv-k3u1fbpfcp-zoom-1.image)

浏览器在阻止这些攻击上做的也很好。同源策略我们已经很熟悉了，它用于限制不同源的站点的资源访问。详细可以戳浏览器的同源策略，这里不再过多介绍。

但是同源策略也有一些例外，任何网站都可以不受限制的加载下面的资源：

-   嵌入跨域 `iframe`
-   `image、script` 等资源
-   使用 DOM 打开跨域弹出窗口

对于这些资源，浏览器可以将各个站点的跨域资源分隔在不同的 `Context Group` 下，不同的 `Context Group` 下资源无法相互访问。

浏览器 `Context Group` 是一组共享相同上下文的 tab、window或iframe。例如，如果网站（`https://a.example`）打开弹出窗口（`https://b.example`），则打开器窗口和弹出窗口共享相同的浏览上下文，并且它们可以通过 `DOM API`相互访问，例如 `window.opener`。

## Spectre 漏洞

长久以来，这些安全策略一直保护着网站的隐私数据，直到 `Spectre` 漏洞出现。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b07282fcb2d24a43ae7e9150c7728460~tplv-k3u1fbpfcp-zoom-1.image)

`Spectre` 是一个在 `CPU` 中被发现的漏洞，利用 `Spectre` ，攻击者可以读取到在统一浏览器下任意 `Context Group` 下的资源。

特别是在使用一些需要和计算机硬件进行交互的 `API` 时：

-   `SharedArrayBuffer (required for WebAssembly Threads)`

-   `performance.measureMemory()`

-   `JS Self-Profiling API`

    为此，浏览器一度禁用了 `SharedArrayBuffer` 等高风险的 `API`。

    ## 跨域隔离

    为了能够使用这些强大的功能，并且保证我们的网站资源更加安全，我们需要为浏览器创建一个跨域隔离环境。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c93b99317ef040a2b22d8d7b6b29c3d9~tplv-k3u1fbpfcp-zoom-1.image)

    下文会提到很多专有术语，我们先把所有跨域相关的名词列出来，以防后面搞混：

    -   `COEP: Cross Origin Embedder Policy`：跨源嵌入程序策略
    -   `COOP: Cross Origin Opener Policy`：跨源开放者政策
    -   `CORP: Cross Origin Resource Policy`：跨源资源策略
    -   `CORS: Cross Origin Resource Sharing`：跨源资源共享
    -   `CORB: Cross Origin Read Blocking`：跨源读取阻止

    我们可以通过 `COOP、COEP` 来创建隔离环境。

    ```
    Cross-Origin-Embedder-Policy: require-corp
    Cross-Origin-Opener-Policy: same-origin
    ```

    下面我们来看一下，这两个 `Hedaer` 的意义，以及如何进行配置。

    ## COOP：Cross Origin Resource Policy

    COOP：跨源开放者政策，对应的 `HTTP Header` 是 `Cross-Origin-Opener-Policy`。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/231d2d4c714f4a209d2e947d6f0917f3~tplv-k3u1fbpfcp-zoom-1.image)

    通过将 `COOP` 设置为 `Cross-Origin-Opener-Policy: same-origin`，将把从该网站打开的其他不同源的窗口隔离在不同的浏览器 `Context Group`，这样就创建的资源的隔离环境。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24a321e06d264191b428700aa5bb64aa~tplv-k3u1fbpfcp-zoom-1.image)

    例如，如果带有 `COOP` 的网站打开一个新的跨域弹出页面，则其 `window.opener` 属性将为 `null` 。

    除了 `same-origin` 、 `COOP` 还有另外两个不同的值：

    ```
    Cross-Origin-Opener-Policy: same-origin-allow-popups
    ```

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e75da89a3b1422ea308a00866c4c83f~tplv-k3u1fbpfcp-zoom-1.image)

    带有 `same-origin-allow-popups` 的顶级页面会保留一些弹出窗口的引用，这些弹出窗口要么没有设置 `COOP` ，要么通过将 `COOP` 设置为 `unsafe-none` 来选择脱离隔离。

    ```
    Cross-Origin-Opener-Policy: unsafe-none
    ```

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e5ffefc426f4206a9fc7c4ca1b1ad2f~tplv-k3u1fbpfcp-zoom-1.image)

    `unsafe-none` 是默认设置，允许当前页面和弹出页面共享 `Context Group`。

    ## CORP、CORS

    要启用跨域隔离，你还首先需要明确所有跨域资源明确被允许加载。这有两种实现方式，一种是`CORP`，另一种是 `CORS`。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/411a6d8b0a254f4bb4e7777f7dec1543~tplv-k3u1fbpfcp-zoom-1.image)

    `CORS`(跨域资源共享)在我么日常解决跨域问题时经常会使用，这个我们已经非常熟悉了，我们再来看看 `CORP`：

    ```
    Cross-Origin-Resource-Policy: same-site
    ```

    标记 `same-site` 的资源只能从同一站点加载。

    ```
    Cross-Origin-Resource-Policy: same-origin
    ```

    标记 `same-origin` 的资源只能从相同的来源加载。

    ```
    Cross-Origin-Resource-Policy: cross-origin
    ```

    标记 `cross-origin` 的资源可以由任何网站加载。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0bc83fda62a4c3a9dcf38255b081b11~tplv-k3u1fbpfcp-zoom-1.image)

    注意，如果是一些通用的 `CDN` 资源，例如 `image、font、video`、等，一定要设置成 `cross-origin` ，否则可能会导致资源无法被正常加载。

    > 对于你无法控制的跨域资源，可以手动在 html 标签中添加 `crossorigin` 属性。

    ## COEP：Cross Origin Embedder Policy

    COOP：跨源嵌入程序政策，对应的 `HTTP Header` 是 `Cross-Origin-Embedder -Policy`。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/636444b56d1e4873a31d152e7848955d~tplv-k3u1fbpfcp-zoom-1.image)

    启用 `Cross-Origin-Embedder-Policy: require-corp`，你可以让你的站点仅加载明确标记为可共享的跨域资源，也就是我们上面刚刚提到的配置，或者是同域资源。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e5aeec7d6fd47948d82a66f1a2dc3c4~tplv-k3u1fbpfcp-zoom-1.image)

    例如，上面的图片资源如果没有设置 `Cross-Origin-Resource-Policy` 将会被阻止加载。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0dab94a80423494287a246054a8a1aa8~tplv-k3u1fbpfcp-zoom-1.image)

    在完全启用 `COEP` 之前，可以通过使用 `Cross-Origin-Embedder-Policy-Report-Only` 检查策略是否能够正常运行。如果有不符合规范的资源，将不会被禁止加载，而是上报到你的服务器日志中。

    ## 测试跨域隔离是否正常

    当你的 `COOP、COEP` 都配置完成之后，现在你的站点应该处于跨域隔离状态了，你可以通过使用 `self.crossOriginIsolated` 来判断隔离状态是否正常。

    ```
    if(self.crossOriginIsolated){
      // 跨域隔离成功
    }
    ```

    好了，你现在可以愉快的使用 `haredArrayBuffer`, `performance.measureMemory` 或者 `JS Self-Profiling API` 这些强大的 API 了～

    ### 参考

    -   <https://web.dev/why-coop-coep/>
    -   <https://web.dev/coop-coep/>




如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
