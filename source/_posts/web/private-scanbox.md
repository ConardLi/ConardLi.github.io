---
title: 聊聊 Google 隐私沙盒的最新进展
category: Web
tag: 
- 浏览器策略
- 隐私保护
- Web安全
date: 2021-11-10	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

今天和大家一起来看一下 Chrome 隐私沙盒的最新进展。

可能很多小伙伴有这样的疑问，我正常做业务的需要关注浏览器的这些安全策略的变化吗？

我的答案是要，太要了，因为这些浏览器的一个小小的策略变化都可能会让我们现在的网站业务受到很大的影响，比如 Cookie 的一些安全策略、缓存分区的变更、UA 信息的更新等等，所以大家一定要重视起来。

所以我也会去经常关心这些策略的变化，如果你也想对你网站的稳定性负责，我推荐你看完这篇文章。

曾经我在公众号的多篇文章里有分析过浏览器对 `Cookie` 的逐步限制和淘汰，比如下面两篇文章：

- [详解 Cookie 新增的 SameParty 属性](https://mp.weixin.qq.com/s?__biz=Mzg2NDAzMjE5NQ==&mid=2247491023&idx=1&sn=22ab9da6088172ea0bb2578a8526150b&chksm=ce6ed963f9195075cbc427f16e42a2c0ae8fa8d4117d3ad5ffbe6581888fd411b204db7c2eb2&token=28145180&lang=zh_CN#rd)
- [当浏览器全面禁用三方 Cookie](https://mp.weixin.qq.com/s?__biz=Mzg2NDAzMjE5NQ==&mid=2247485523&idx=1&sn=e7f3989448f5ff1e8905fc6596268e33&chksm=ce6eccfff91945e990e0b21e777f5a85f3f0699f7d51e45a1dd83d0bf36eaf926f7e90fbe3ff&token=379611469&lang=zh_CN&scene=21#wechat_redirect)

如果你想了解本篇文章的背景，不如先读读上面两篇文章，其实浏览器在对 `Cookie` 增加诸多限制的背后，一直在寻找它的替代品。

其中，备受关注的就是 `Google` 提出的隐私沙盒(`Privacy Sandbox`)，它其实不是单单一项 `API`，而是包括了一系列相关安全措施和方案。

![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/effc8f78074d4235852a7ed0ca43aa02~tplv-k3u1fbpfcp-zoom-1.image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b824c5a906174250a7f07eb00cc4ea43~tplv-k3u1fbpfcp-zoom-1.image)

下面，我们来看一下它的最新进展。

## 防止私密跟踪

浏览器减少了显式跨站点跟踪的能力，他们还需要解决的是 `Web` 平台中一些暴露识别信息的区域，这些识别信息支持对用户进行指纹识别或隐蔽跟踪。

### User-Agent 信息减少并逐步迁移至 User-Agent Client Hints

为了减轻 `User-Agent` 的身份标识作用， `Chrome` 正在逐步减少 `User-Agent` 中的信息，并且逐步迁移到  `User-Agent Client Hints`

我们可以到 `Chrome` 博客（`https://blog.chromium.org/2021/09/user-agent-reduction-origin-trial-and-dates.html`）去查看整个时间线。

从 `Chrome 92` 开始，我们在浏览器使用的一些例如 `navigator.userAgent 、navigator.appVersion、navigator.platform` 这样的 API 将会收到警告。

新的 `User-Agent Client`  只会包括如下信息：

- `Sec-CH-UA`: 浏览器名称和主要/重要版本
- `Sec-CH-UA-Mobile`: 是否为移动设备
- `Sec-CH-UA-Platform`: 操作系统名称

例如，`Chrome/90.0.4430.85` 这样的版本号将会被简化为 `Chrome/90.0.0.0` ，这极大的减轻了 UA 对用户的身份标识作用。当然这个改动之后，一部分基于 UA 做身份标识的库和业务将会受到很大影响，大家提前注意一下。

如果你现在使用的是 `navigator.userAgent` ，应该逐步迁移到 `navigator.userAgentData`：

```
if (navigator.userAgentData) {
  // use new hints
} else {
  // fall back to user-agent string parsing
}

```

## 加强跨站隐私的边界

第三方 `cookie` 是实现跨站点跟踪的关键机制，能够逐步淘汰它是一个重要的里程碑，但在淘汰它之前首先需要解决其他形式的跨站点存储或通信问题。

### 联合凭证管理 API

联合证书管理（`FedCM`）是一项处于早期的提案，主要就是在保护用户隐私的前提下为网络用户提供一个新的身份标识，里面包括了如何与其他站点共享用户身份，以及如何更安全的进行跨站点跟踪等等，下面有一个早期版本的使用示例：

```
async function login() {
  // Feature detection.
  if (!navigator.id) {
    console.log("FedCM is not available.");
    return;
  }

  try {
    // In this example, <https://idp.example> is the IdP's URL.
    // |request| could include any OAuth request fields.
    const token = await navigator.id.get({
        provider: "<https://idp.example>",
        request: "client_id=1234&nonce=Ct60bD&response_type=code&scope=email openid profile",
        mode: "permission",
    });

    log(`received token: ${token}`);
  } catch (e) {
    log(`rejected with ${e}`);
  }
};

```

当然，这个提案还处于非常早期的版本，使用方式可能会随着时间的推移发生很大的改变。

> 具体可以到这里了解更多：https://github.com/WICG/FedCM
> 

### Cookie

随着 `cookie` 相关提案的进展，我们应该审核一下我们自己的网站上跨站 `Cookie` 设置 `SameSite=None` 的情况了。

### CHIPS

如果我们允许站点上的 `Cookie` 在跨站点的情况下被发送（例如 `iframe` 嵌入或 `API` 调用），应该遵循 `CHIPS 提案` ，它会将 `cookie` 标记为 `已分区`，并且将它们放在每个顶级站点的单独 `cookie jar` 中。

![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/207e75a463144e1dba87e0462cb73046~tplv-k3u1fbpfcp-zoom-1.image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a93bf30904a4017ac9bd7a708689cce~tplv-k3u1fbpfcp-zoom-1.image)

目前这个提案正在处于测试状态，我们可以通过开启 `chrome://flags/#partitioned-cookies` 的 `--partitioned-cookies` 来打开它。

### First-Party Sets 策略

`First-Party Sets` 提出了一种明确定义在同一主体下拥有和运营的多个站点关系的方法。比如  `.tmall.com、taobao.com` 都可以被定义为同一主体运营 。意味着它可以定义跨站点上下文仍然是 `first-party` 的情况。

`Cookie` 可以包含在第一方集合中，也可以排除在第三方上下文中。

![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c86ca927dc84a91a43796234cbf4975~tplv-k3u1fbpfcp-zoom-1.image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4d71475f681d4682b159b110f6d21be3~tplv-k3u1fbpfcp-zoom-1.image)

我们可以通过开启 Cookie 的 `SameParty` 属性来实现，具体可以参考我这篇文章：

- [详解 Cookie 新增的 SameParty 属性](https://mp.weixin.qq.com/s?__biz=Mzg2NDAzMjE5NQ==&mid=2247491023&idx=1&sn=22ab9da6088172ea0bb2578a8526150b&chksm=ce6ed963f9195075cbc427f16e42a2c0ae8fa8d4117d3ad5ffbe6581888fd411b204db7c2eb2&token=28145180&lang=zh_CN#rd)

## 缓存分区

从性能的角度来看，浏览器的缓存机制已经运行了很长时间了。但是，网站响应 HTTP 请求所花费的时间可以表明浏览器过去曾经访问过相同的资源，这使浏览器容易受到安全和隐私的攻击，比如：

- 检测用户是否访问过特定站点：攻击者可以通过检查缓存是否具有特定于特定站点或一组站点的资源来检测用户的浏览历史记录。
- 跨站点搜索攻击：攻击者可以通过检查特定网站使用的“无搜索结果”图像是否在浏览器的缓存中来检测用户的搜索结果中是否包含任意字符串。
- 跨站点跟踪：缓存可用于存储类似 `cookie` 的标识符，作为跨站点跟踪机制。

![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e25926da96e44cda3f787807cad8166~tplv-k3u1fbpfcp-zoom-1.image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/84cc092ca2a44b7097bd4b1b60d0a5cc~tplv-k3u1fbpfcp-zoom-1.image)

为了减轻这些风险，`Chrome` 从 `Chrome 86` 开始对 `HTTP` 缓存进行分区。

具体可以参考我这篇文章：

- [新的浏览器缓存策略变更：舍弃性能、确保安全](https://mp.weixin.qq.com/s?__biz=Mzg2NDAzMjE5NQ==&mid=2247486742&idx=1&sn=f0ed275efa1155166cac5de0915d7f46&chksm=ce6ec9baf91940ac51d584f13fa896fb8b61661145e738a704682c79b15f9faf784add5b0cb1&token=28145180&lang=zh_CN#rd)

## 广告内容展示

随着浏览器逐步淘汰第三方 `cookie`，在广告业务下，我们需要在不继续启用跨站点跟踪的情况下，使用新的 API 来替代它。

### FLoC

`FLoC` 是一项无需个人跨站点跟踪就可以实现兴趣广告推荐的提案。

![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a451c021ca0f4f29b362ddb1b4c8b106~tplv-k3u1fbpfcp-zoom-1.image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d902a38cec304262af068753f083d16f~tplv-k3u1fbpfcp-zoom-1.image)

> LoC 的原理，简单来说就是：浏览器将具有相似浏览记录的用户分到一个群组（Cohort），广告平台通过联邦运算，可以为这些群组提供合适的广告。尽管在联邦学习过程中，会存在信息交换，但是联邦学习框架的存在，保证了信息交换时，彼此匿名并且脱敏，无法反向破解或者穷举，保证个人隐私和法务合规性。根据谷歌自己的评估，FLoC 的有效率达到了使用第三方 Cookie 的 95%。
> 

详情可以看看这篇文章：[https://developer.chrome.com/docs/privacy-sandbox/floc/](https://developer.chrome.com/docs/privacy-sandbox/floc/)

## 数字广告的衡量方式

在没有跨站点跟踪的情况下展示的广告，我们还是需要一些隐私保护机制来衡量这些广告的有效性(比如转化率、点击率等等)的。

### Attribution Reporting API

`Attribution Reporting API` 可以在不借助跨站点跟踪技术的情况下帮助我们记录用户对广告的浏览、点击等操作。

![https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27dd5aa9b1194f5bb723cd76d0b84938~tplv-k3u1fbpfcp-zoom-1.image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4ed8749605b84e7b8ddab81a396372b9~tplv-k3u1fbpfcp-zoom-1.image)

这个 API 在 `Chrome 92` 版本开始测试，目前还处于测试状态，详情可以到这里了解：[https://developer.chrome.com/docs/privacy-sandbox/attribution-reporting/](https://developer.chrome.com/docs/privacy-sandbox/attribution-reporting/)

## 最后

好了，以上就是  `Privacy Sandbox` 目前的最新进展，有什么问题欢迎和我讨论。



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
