---
title: 前端性能优化 - 网络优化
category: 性能和体验
tag: 
- 性能优化
- HTTP
- 工程实践
date: 2020-12-27
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



## 开启 HTTP2

主要收益有三：

-   多路复用：真正意义的使多次请求复用一个 `TCP` 链接，降低建连时间
-   二进制格式传输信息：更贴合机器语言，解析更高效，性能更好
-   首部压缩：降低头部体积

### 多路复用

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4146fd6bf35428e8c630afc617e64ca~tplv-k3u1fbpfcp-zoom-1.image)

在 `HTTP1.1` 中，每次TCP连接只能下载一个资源，虽然可以使用长连接来复用 tcp 连接，但是多次请求无法并发：

-   1.每请求一个资源就会来一次`TCP`连接，且有”队首阻塞”问题出现，这样在资源过多的情况下，`TCP`连接消耗的时间会逐渐增加
-   2.每次发送请求的 `HTTP` 头部信息基本相同，造成头部信息冗长，耗费流量
-   3.从获取解析 `index.html` 文件到碰撞`<link>、<script>`等标签时，中间流失的时间没有充分利用

在 `HTTP2` 中：同域名下所有通信都在单个连接上完成，只需要占用一个 `TCP` 连接，使用一个连接并行发送多个请求和响应, 这样整个页面资源的下载过程只需要一次慢启动，同时也避免了多个 `TCP` 连接竞争带宽所带来的问题。单个连接可以承载任意数量的双向数据流，并行交错地发送多个请求 / 响应，请求 / 响应之间互不影响。

## 二进制传输协议

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1726765b18c14a56ab4cc2e0ba5b2010~tplv-k3u1fbpfcp-zoom-1.image)

H2 使用二进制格式传输信息，相比 http 1.1 使用文本(plaintext)传输相比：

-   具有更贴合机器语言，解析更高效，性能更好
-   体积更小，本身是 0 1 构成的二进制流，避免了 http 1.1 一些无用空白或者低效的压缩情况
-   传输不容易出错

## 首部压缩

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0052f3aedbfe4131a4fdb8a7c000c57e~tplv-k3u1fbpfcp-zoom-1.image)

在 `http 1.1` 中，消息头是不可以压缩的，对于消息头体积较大的情况（如 Cookie 头中出现复杂长消息），性能影响非常明显。

H2 可以消除冗余的消息头、压缩消息头体积：使用 『HPACK』算法来压缩消息头，同时在客户端和服务器两端建立“字典”，用索引号表示重复的字符串，类似的请求就不会再重复发送消息头。

头部压缩可能有 90% 左右的提升，`http 1.1` 统计的平均响应头大小有 500 个字节左右，而 H2 的平均响应头大小只有 20 多个字节，提升比较大。

## 域名收敛

把页面资源部署在尽可能少的域名下，配合 H2，可以最大化的节省 DNS 解析、TCP 建连等网络成本，更好的发挥其多路复用的优势，大幅提升页面性能。

> 同域名下所有通信都在单个连接上完成，只需要占用一个 TCP 连接，使用一个连接并行发送多个请求和响应, 这样整个页面资源的下载过程只需要一次慢启动，同时也避免了多个 TCP 连接竞争带宽所带来的问题。

我们可以将页面中的 `CDN` 资源都收敛到常量中，统一引用：

```
const CDN_PRE = 'https://xxx.cdn.com/';
​
export default {
    LOGO: `${CDN_PRE}img/logo.png`,
    ICON: `${CDN_PRE}img/icon.png`
}
```

## DNS 预解析

用户请求页面时，首先通过 `DNS` 把域名解析为具体的 `ip` 地址，然后向具体的 `ip` 发起实际页面请求。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f68843bd1ecd48d9abd73073d40ac6d2~tplv-k3u1fbpfcp-zoom-1.image)

使用 `dns-prefetch` 的 `link` 标签来向浏览器声明在接下来的页面中即将用到某个域名下的资源，要求浏览器尽可能早的提前发起对该域名的 `dns` 解析操作。

`DNS` 预解析比较适合用于 `CDN` 域名场景，将常用的 `CDN` 域名进行 `DNS` 预解析：

```
    <!-- DNS 预解析 -->
    <link rel="dns-prefetch" href="//xxx.cdn.com/">
    <link rel="dns-prefetch" href="//xxx.cnd2.org/">
```

## 提前建立网络连接

浏览器在建立网络连接时，要经过 `DNS` 解析、`TCP` 握手等过程，在 `https` 场景下还需要进行 TLS 加密信息验证。这些都是相当耗时的操作。可以使用 `preconnet` 的 `link` 标签来提前触发上述操作，它会告诉浏览器，页面即将使用某域名下的资源，可以让浏览器提前建立网络连接，在页面真正发起资源请求时，会使用已经建立的网络连接，直接跳过这些耗时建连操作。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6bf2b666c05e48268235419cd9b486d7~tplv-k3u1fbpfcp-zoom-1.image)

使用网络预连接的前提是可以判断页面有极大可能使用预先建立的网络连接(如 `Server API` )；对于 `CDN` 的资源，由于缓存的存在大多数情况并不会发送资源请求，所以不适合进行 `preconnet`。

```
    <!-- 提前建立网络链接 -->
    <link rel="preconnect" href="//xxx.api.net" crossorigin>
    <link rel="preconnect" href="//xxx.api2.com" crossorigin>
```

## brotli 压缩

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20eaf81b66634923bb4b2bd7db427da8~tplv-k3u1fbpfcp-zoom-1.image)

谷歌在 `2015` 年发布 `Brotli` 压缩算法，相比 gzip，它具有更高的压缩比和更快的压缩性能。

-   `JavaScript` 体积比 `gzip` 小 `14%`

-   `HTML` 体积比 `gzip` 小 `21%`

-   `CSS` 体积比 `gzip` 小 `17%`

    ## 支持 TLS 1.3

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b7d5f89a6d4c4742b01547e45ead0d1f~tplv-k3u1fbpfcp-zoom-1.image)

    `TLS 1.3` 是时隔九年对 `TLS 1.2` 等之前版本的新升级，也是迄今为止改动最大的一次。针对目前已知的安全威胁，IETF（Internet Engineering Task Force，互联网工程任务组） 正在制定 TLS 1.3 的新标准，使其有望成为有史以来最安全，但也最复杂的 `TLS` 协议。

    使用 `TLS 1.3` 协议只需要一次往返（ 1-RTT ）就可以完成握手，而使用 `TLS 1.2` 需要两次往返（ 2-RTT ）才能完成握手，然后才能发送请求。相比 `TLS 1.2`，`TLS 1.3` 的握手时间减半。

    ## 支持 HSTS

    如果你的站点在服务端开启了强制 HTTPS，如果这时用户使用 `HTTP` 协议进行访问，服务端会自动 `302` 到 `HTTPS`，这会增加一次请求成本。

    ![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8924b336208f4418a4e7871d1a09a8a3~tplv-k3u1fbpfcp-zoom-1.image)

    `Strict-Transport-Security`（简称HSTS）HTTP Header 会告知浏览器在和网站进行通信的时候强制性的使用 `HTTPS`，而不是通过明文的 `HTTP` 进行通信，注意是在浏览器端进行 `HTTPS` 重定向，这个会减少一次请求时间。

    未完待续，后续预告：

    -   资源加载优化
    -   运行时优化
    -   服务端优化
    -   性能指标和测试工具



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。

