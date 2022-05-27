---
title: Google 最新的性能优化方案 — 私有预取代理
category: Web
tag: 
- 最新提案
- 浏览器策略
- 性能优化
date: 2022-05-15
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

网页的性能，大部分情况下是影响用户使用体验的第一要素，特别是对于很多电商、金融网站，可能几秒的性能提升就意味着更大的转化率和收益。

所以优化网页的性能，一直是前端工程师最热衷的工作之一。今天我们来看看 Google 提出的一种新的性能优化方案，现在已经在 `Google Search` 中得到了实践。


## 什么影响了 LCP？

在之前的文章 [解读新一代 Web 性能体验指标](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490403&idx=1&sn=9d408c8264fda966e3254ece8d663601&chksm=c2e2ee48f595675ef574b1e39ed72ea1e032ee0465e255da7a2dfafc7217521b205d3ef5120b&token=402055249&lang=zh_CN&scene=21#wechat_redirect) 中，我介绍了 `Google` 新提出的 `Core Web Vitals`，其中包括了 `LCP、FID、CLS` 三大指标。

![Core Web Vitals](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b579cf985bc045eca88b1632c94a434f~tplv-k3u1fbpfcp-zoom-1.image)

`Largest Contentful Paint (LCP) `（最大内容渲染），又是其中最重要的指标。这个指标很好理解，也就是一个网页当前视口中可见的最大元素的渲染时间。为了良好的用户体验，这个时间应该尽量控制在 `2.5S` 之内。

那么有哪些因素会影响网页的 `LCP` 呢？

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b57b20aefac48e9ac4d41087d87a2f4~tplv-k3u1fbpfcp-zoom-1.image)


当用户访问网页时，浏览器从服务器请求 `HTML`。服务器返回 `HTML` 响应，然后 `HTML` 会告诉浏览器下一步的工作，包括请求 `CSS、JavaScript`、字体和图像等资源。这些资源返回后吗，浏览器还会做一些其他的评估工作，最终在页面上进行布局和渲染。

实际上，大部分时间都花费在了从浏览器到服务器之间的传输上了。根据 `Google Chrome` 的统计显示，网页大约 `40%` 的可见延迟都花费在浏览器等待服务器返回的第一个字节上了。


## 数据预取

那么， 如果可以预取网页上所需的资源文件，也就是在用户访问这些页面之前就获取它们，这将给网页带来巨大的性能提升。

数据预取后，网页在可以正常显示之前只剩下了评估、布局和渲染工作了。

![数据预取](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c4c582f793fe4801b7515c26835f397b~tplv-k3u1fbpfcp-zoom-1.image)

实际上，我们一些常见的性能优化的手段：

- `rel="dns-prefetch"`：向浏览器声明在接下来的页面中即将用到某个域名下的资源，要求浏览器尽可能早的提前发起对该域名的 dns 解析操作。
- `rel="preconnet"`：告诉浏览器页面即将使用某域名下的资源，可以让浏览器提前建立网络连接，在页面真正发起资源请求时，会使用已经建立的网络连接，直接跳过这些耗时建连操作。

这些都属于数据预取的措施，我们可以做到预取一些我们当前站点的主要资源。

在同站的情况下，这些手段很容易实施，但是对于跨站的常见，就不那么简单了。


## 跨站数据预取

什么是跨站的场景的数据预取呢呢，比如我们当前的网站只是个导航，或者搜索引擎，大部分情况下我们不会在当前的网站停留太久，而是从当前网站跳到其他网站上去，比如 `Google Search`：

![Google Search](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ef6e090ddcd4eae9c0981377d3c0256~tplv-k3u1fbpfcp-zoom-1.image)

我们当前的网站的性能优化已经做的很好了，现在我们要考虑的是怎么让这些跨站的第三方站点也能快速打开。

把所有可以打开的第三方网站的数据都提前下载一遍？这当然可以让用户打开这些页面的时候更快一点，但我们还要考虑一些其他的因素：

- 用户不一定会点击这些链接，那我们提前预取的数据不就属于资源浪费了吗？
- 这些网站如果携带用户的 IP 地址或者 Cookie 怎么办？不会对用户隐私造成威胁吗？

## 私有预取代理方案

为了实现更安全隐私的数据预取，`Google` 提出了一种新的数据预取方案：`Private prefetch proxy`（私有预取代理），`Google Search` 已经实施了这项方案，导航的 `LCP` 预计有 `20%-30%` 的提升！


### 安全的通信

私有预取代理方案使用 `CONNECT` 代理在 `Chrome` 和存储了要预取内容的服务器之间建立安全通信通道。

这个安全通信通道可以防止任何 `Proxy` 从中间抓取任何数据传输。另外，虽然私有预取代理必须看到主机名才能建立安全的通信通道，但它隐藏了完整的请求 `URL`，也看不到资源本身。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f880e28978d1484ebaed7a7f47286cc3~tplv-k3u1fbpfcp-zoom-1.image)

此外，由于安全通信通道是端到端加密的， 一些代理或者中介既不能抓取到主机名称，也不能抓取到预取站点的内容。代理本身也会阻止目标服务器查看用户的 `IP` 地址。


### 防止用户识别

除了前面详述的网络安全方面，私有预取代理还可以防止服务器在预取时通过先前存储在其设备上的信息来识别用户。目前，`Chrome` 会限制只有用户没有 `Cookie` 或其他本地状态的网站才能使用私有预取代理方案。以下是通过 `Private Prefetch Proxy` 发出的预取请求的限制：

- `Cookies`：预取请求不允许携带 `Cookies`。
  - 如果资源有 `Cookie`，`Chrome` 只会发送不带 `Cookie` 的请求，也不会使用响应内容。
  - 对预取请求的响应中可以包含 `Cookie`，但只有在用户跳转到预取页面时才会在浏览器保存这些 `Cookie`。
- 指纹识别：其他可用于指纹识别的数据（例如 `User-Agent`）也进行了调整。`Prefetch Proxy` 发送的 `Header` 只携带有限的信息。


> `Google` 也正在计划将 `Private Prefetch Proxy` 扩展到带有 `Cookie` 的网站，同时利用一些其他的方案来保障用户隐私。


### 缓存

即使资源已经在缓存中了，`Chrome` 也会预取资源，但它们不会携带任何条件请求头，例如 `ETag` 或 `If-Modified-Since`（这些 `Header` 中包含服务器设置的值，即使没有 `Cookie` 也可用于用户跟踪）。进行这样的预取措施是为了防止将客户端的缓存状态泄漏到预取的网站。此外，如果用户决定跳转到已经预取的网站，`Chrome` 只会将预取的资源提交到缓存中。


## 开始使用私有预取代理

### 对于需要数据预取的网站

对于大部分普通站点，我们希望在其他网站导航到我们网站的时候更快。

目前 `Private Prefetch Proxy` 还处于众测阶段，想要提前体验的话需要在服务器部署一份 `traffic-advice` 配置：

```json
[{
  "user_agent": "prefetch-proxy",
  "google_prefetch_proxy_eap": {
    "fraction": 1.0
  }
}]
```

-  `google_prefetch_proxy_eap` 选项可以让我们的网站加入数据预取代理。
- `fraction` 字段可以控制私有预取代理的流量百分比。

这个配置应该放在我们服务器的 `/.well-known/` 路径下，（即 `/.well-known/traffic-advice` ）。

### 对于导航网站

对于像 `Google` 这样的导航网站，我们需要用户在我们的网站打开其他网站的时候更快，我们可以在页面上增加下面的配置，这可以让 `Chrome` 知道应该通过数据预取代理提取哪个页面：

```html
<script type="speculationrules">
{
  "prefetch": [
    "source": "list",
    "urls": ["https://conardli.top/blog"],
    "requires": ["anonymous-client-ip-when-cross-origin"]
  ]
}
</script>
```

这里需要注意的是，增加了数据预取意味着，即使在没有用户实际请求的情况下也会给我们网站增加额外的流量。

这可能需要具体的网站负责人具体评估，如果觉得额外浪费一些流量换取更好的用户体验是值得的，那就没问题。

但是我们也可以通过一些措施来环节一些，比如限制浏览器只预取相对关键的资源（例如 Script、CSS 等），本质上就是网页性能和额外流量之前的权衡。

另外，我们也可以为网站添加一些推荐规则，让浏览器可以自己推断用户可能会访问的页面，具体推测规则可以参考：`https://web.dev/speculative-prerendering`


## 参考 

- https://tools.ietf.org/html/rfc7231#section-4.3.6
- https://github.com/WICG/nav-speculation/
- https://developer.chrome.com/blog/cross-origin-prefetch/
- https://developer.chrome.com/blog/private-prefetch-proxy/



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。


