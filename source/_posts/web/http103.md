---
title: HTTP 新增的 103 状态码，这次终于派上用场了！
category: Web
tag: 
- 浏览器策略
- 最新提案
- 性能优化
date: 2022-07-16	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。




说到 `HTTP` 的 `103` 状态码，你可能很早就听说过了，但是你不一定真的理解了它。

这很正常，这个状态码早在 `2017` 年就被提出来了，但是支持它的服务器和浏览器真的很少。

直到前几天，`Chrome` 宣布在 `Chrome 103` 版本对 `HTTP 103` 状态码提供了支持，不得不说老外还挺皮啊...

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f344836da1224a9780886d5470de6ac9~tplv-k3u1fbpfcp-zoom-1.image)

今天我们就来看一下，`HTTP 103` 状态码究竟有什么用途。

## 资源加载的性能问题

随着时间的推移，网站变得越来越复杂。一些大型网站的服务器可能需要执行很多重要的工作（例如，访问数据库或访问源服务器的 `CDN`）来为请求的页面生成 `HTML`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8147e638e284ce0ad0cd1f7cb5f6a57~tplv-k3u1fbpfcp-zoom-1.image)

但是，这种 `服务器的思考时间` 会在浏览器开始渲染页面之前带来额外的延迟。因为浏览器需要先把 `HTML` 页面加载回来，才能知道下一步去加载哪些 `JavaScript、CSS` 或字体文件等。中间这段时间实际上就浪费掉了，对用户访问我们的页面来讲，这段等待时间就是白屏或是不可用的状态。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/639c61005f374c63a91cb585570a73ff~tplv-k3u1fbpfcp-zoom-1.image)


我们来看看抖音 `Web` 站的资源加载：浏览器先要等待前面两个 `HTML` 的大约 `800 ms` 的时间才能去加载后面的 `JS 、CSS` 等资源文件。

有没有办法在等待 `HTML` 响应的同时就去提前把重要的静态资源文件也加载回来呢？

## HTTP 103 状态码

`HTTP 103` 状态码 (`Early Hints`) 是一个信息性 `HTTP` 状态代码，可以用于在最终响应之前发送一个初步的 `HTTP` 响应。

利用 `HTTP 103` 状态码，就可以让服务器在服务器处理主资源的同时向浏览器发送一些关键子资源（`JavaScript、CSS` 或字体文件）或页面可能使用的其他来源的提示。

浏览器可以使用这些提示来预热连接，并在等待主资源响应的同时请求子资源。换句话说，`Early Hints` 可以通过提前做一些工作来帮助浏览器利用这种 `服务器思考时间`，从而提升页面的渲染性能。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24fbfa17815b4b9080d942754c2053eb~tplv-k3u1fbpfcp-zoom-1.image)

在某些情况下，这可以帮助 `LCP`（最大内容绘制）至少提升几百毫秒。例如在 `Shopify` 和 `Cloudflare` 所观察到的来看，`LCP` 大概提升了 1 秒。


![启用 Early Hints 前后对比](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f1deaf8da27448690df5a6ebd6cd658~tplv-k3u1fbpfcp-zoom-1.image)

## 什么样的网站适合 Early Hints

在开始使用之前，可能要先思考下，什么样的网站比较适合这个优化。

如果你的网站的主页面响应非常快，可能没什么必要。比如对于大部分 `SPA`（单页应用），可能用处不是那么大。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a301c0332c59433f8acee541fb3902d5~tplv-k3u1fbpfcp-zoom-1.image)

在 `SPA` 中，大部分的逻辑都在客户端，`HTML` 很小，下发 `HTML` 的服务器也基本就是没有什么逻辑的静态服务器。大部分情况下只会包括一个 `Root` 节点，以及一些资源的 `Link`，大部分逻辑和加载时间其实都在打包后的 `JavaScript` 中。这种情况我们只需要使用常规的 `rel=preload、rel=preconnect` 等手段就可以了。

但是在`SSR` 项目中，加载 `HTML` 往往需要在服务端花费更多的时间，因为服务端可能和数据库交互以及将数据拼接成 `HTML` 元素。相比之下，加载其他的脚本和样式资源可能花费的时间要更短一点，这种站点启用 `Early Hints` 是比较合适的。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31c2569187c64f09bfaa2c43a8d2c628~tplv-k3u1fbpfcp-zoom-1.image)



## 启用 Early Hints

在 `Chrome 103` 版本，对 `HTTP 103` 状态码 (`Early Hints`) 提供了支持。

启用 `Early Hints` 的第一步就是要确认我们站点的 `主页面`，也就是用户通常在访问我们的网站时开始的页面。如果我们有很多来自其他网站的用户，`主页面` 可能就是主页或热门的产品列表页面。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5e4092254436429aaaa6e00d78cae7cb~tplv-k3u1fbpfcp-zoom-1.image)


`Early Hints` 的用途会随着用户在我们的站内导航的次数而降低，因为浏览器可能已经在前几次导航中把所有需要的子资源请求回来了，给用户良好的第一印象是最重要的！

确认了站点的 `主页面`，下一步就是确定哪些来源或子资源将是最佳预连接或预加载的候选者。通常情况家，我们要找的就是对关键用户指标（`LCP` 或 `FP`）贡献最大的源和子资源。具体一点，就是找到阻塞渲染的子资源，例如同步 `JavaScript`、样式表，甚至网络字体等。

然后就是尽量避免选择已经过时或者不再被主页面使用的资源。

比如一些经常更新或者带有 `hash` 的资源（`conardli.top/static/home.aaaa1.js`），尽量不要选择，这可能会导致页面需要加载的资源和实际预加载的资源不匹配。

比如我们举个例子：

首先我们去服务器请求主页面：

```
GET /home.html
Host: conardli.top
User-Agent: [....] Chrome/103.0.0.0 [...]
```

服务器预测站点将需要 `home.aaaa1.js` ，并建议通过 `Early Hints` 预加载它：

```
103 Early Hints
Link: </home.aaaa1.js>; rel=preload; as=script
[...]
```

随后，客户端马上向服务端请求了 `home.aaaa1.js`。然而，这时 `JS` 资源更新了，主页面已经需要另外一个版本的 `JS` 了。

```
200 OK
[...]
<HTML>
<head>
   <title>Conardli's Blog</title>
   <link rel="script" href="/home.aaaa2.js">
```

所以，我们最好选择一些比较稳定的资源进行预加载，我们可以对 JS 进行拆包，将不经常发生变化的稳定部分和经常发生更新的动态脚本部分拆成多个资源。我们只对稳定部分实施预加载，在浏览器获取到主页面后再去加载动态部分。

```html
<HTML>
<head>
   <title>code秘密花园</title>
   <link rel="script" href="/home.js">
   <link rel="script" href="/home.aaaa1.js">
```


最后，在服务器端，查找已知支持 `Early Hints` 的浏览器发送的主页面请求，并响应 `103 Early Hints`。在 `103` 响应中，会包括相关的预连接和预加载提示。主页面准备好后，再按照正常的响应进行响应。为了向后兼容，最好在最终响应中包含 `LINK HTTP` 标头，甚至也可以增加在生成主页面时需要的一些明显的关键资源。

`Early Hints` 响应：

```
GET /main.html
Host: conardli.top
User-Agent: [....] Chrome/103.0.0.0 [...]
103 Early Hints
Link: <https://fonts.google.com>; rel=preconnect
Link: </main.css>; rel=preload; as=style
Link: </common.js>; rel=preload; as=script
```

成功响应：

```
200 OK
Content-Length: 7531
Content-Type: text/html; charset=UTF-8
Content-encoding: br
Link: <https://fonts.google.com>; rel=preconnect
Link: </main.css>; rel=preload; as=style
Link: </common.js>; rel=preload; as=script
Link: </experimental.3eab3290.css>; rel=preload; as=style
<HTML>
<head>
   <title>code秘密花园</title>
   <link rel="stylesheet" href="/main.css">
   <link rel="stylesheet" href="/home.aaaa1.css">
   <script src="/common.js"></script>
   <link rel="preconnect" href="https://fonts.googleapis.com">
```

## 和 HTTP2/Push 有什么关系？


看到这里你可能发现了，这玩意和 `HTTP2` 的服务器推送 (`Server Push`)  很像啊。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e84cc94eaad742c48e3b4737e9b149f8~tplv-k3u1fbpfcp-zoom-1.image)

`Server Push` 即在浏览响应 `HTML` 文件的时候，服务器会同时将所需的资源文件主动推送给浏览器。

浏览器在收到推送的资源之后会缓存到本地。等解析 `HTML` 发现需要加载对应资源的时候会直接从本地读取，不必再等待网络传输了。

虽然这听起来很神奇，但这个方案有非常大的缺陷：`Server Push` 很难避免推送浏览器已经拥有的子资源，其实很多资源在浏览器第一次请求到就已经缓存下来了。这种 “过度推动” 会导致网络带宽的使用效率降低，从而显着阻碍性能优势。总体而言，`Chrome` 数据显示 `HTTP2/Push` 实际上对整个网络的性能产生了负面影响。

所以，`Chrome` 宣布移除了对 `HTTP/2 Server Push` 特性的支持：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3fe162a3d7f8452b9bf3ad1b5023e380~tplv-k3u1fbpfcp-zoom-1.image)


相比之下，`Early Hints` 在实践中表现更好，因为它结合了发送初步响应的能力和提示，浏览器实际上只负责获取它实际需要的资源。虽然 `Early Hints` 还没有涵盖 `HTTP/2 Server Push` 理论上可以解决的所有用例，但是它解决了网络带宽浪费的问题，可以说是 `HTTP/2 Server Push` 的升级版。


## 支持情况

浏览器支持情况：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ba5ff05072d4f80a725ed880ccfbfae~tplv-k3u1fbpfcp-zoom-1.image)

服务器支持情况：

- `Node.js`：通过 `Fastify` 插件提供支持；
- `Apache`： 通过 `mod_http2` 支持；
- `H2O`： 支持；
- `Nginx`： 实验模块。


## 最后

参考链接：

- https://developer.chrome.com/blog/early-hints/
- https://github.com/bashi/early-hints-explainer
- https://httpd.apache.org/docs/2.4/howto/http2.html


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
