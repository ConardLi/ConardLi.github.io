---
title: 聊聊 Cookie 的 CHIPS 机制
category: Web
tag: 
- 最新提案
- 浏览器策略
- Cookie
- Web安全
date: 2022-03-22	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

今天我们继续来聊 `Cookie` 。还是三方 `Cookie` 的问题，我们先回顾一下：

## 三方 Cookie

第三方 `Cookie` 可以让服务跟踪用户并从许多不相关的顶级站点分析他们的信息，我们一般称之为跨站点跟踪。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e51cc7491ea4eb6bfca631220df5afc~tplv-k3u1fbpfcp-zoom-1.image)

例如，当用户访问站点 `A` 时，来自站点 `C` 的 `iframe` 内容可以在用户的浏览器上设置一个 `Cookie` 来响应跨站点的请求。如果用户随后访问也嵌入了 `C` 的站点 `B`，则站点 `C` 可以访问到先前在用户访问站点 `A` 时设置的相同 `Cookie`。

为了保护用户的隐私，浏览器供应商正在对这种行为进行限制，并逐步停止对第三方 `Cookie` 的支持。目前 `Safira` 已经完全禁止了三方 `Cookie`，`Chrome` 也宣布将会在未来的两年内弃用。

目前业界仍然没有比较成熟的方案来应对三方 `Cookie` 被禁用后的各种影响。具体三方 `Cookie` 禁用后的影响可以看这篇文章：

[当浏览器全面禁用三方 Cookie](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490361&idx=1&sn=ebc8dcc4d095cc7ba748827dff158f2b&source=41#wechat_redirect)


去年 `Cookie` 新增的 `SameParty` 属性可以在一定场景下替代三方 `Cookie`，它可以让在同一个运营主体下不同域名的 `Cookie` 也能共享。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8cfc724c4825466ba157a2419df5090f~tplv-k3u1fbpfcp-zoom-1.image)

但是应对场景还是有些局限，另外配置也比较复杂，所以目前还没得到大规模使用。详细解读看我这篇文章：


[详解 Cookie 新增的 SameParty 属性](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490863&idx=1&sn=a9cfa840c4c2c664aab28b6c70245dc9&chksm=c2e2e804f5956112bc39d08c696ba232949d58cf447387bcbfc330a3d4cd6eb84d2e082e4dea&token=406950475&lang=zh_CN#rd)

## 一个常见的业务场景

假如我们现在有一个通用的聊天服务，由第三方服务 `support.chat.example` 提供支持，我们的网站 `retail.example` 希望用 `iframe` 的方式嵌入这个聊天框。这个嵌入式的聊天服务可能会依赖 `Cookie` 来保存用户的交互历史记录。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0f9de791d954412bd23b6e5f13d9028~tplv-k3u1fbpfcp-zoom-1.image)


假如没有了设置跨站点三方 `Cookie` 的能力，则 `support.chat.example` 可能需要更改为依赖 `retail.example` 传递给他们的第一方会话的一些标识符。在这种情况下，每个嵌入 `support.chat.example` 聊天服务的网站都需要额外的设置来传递状态，这大大增加了开发成本。


或者，我们也可以允许 `support.chat.example` 请求 `retail.example` 页面上的 `JavaScript`。这引入了非常大的安全风险，也不是个靠谱的方法。

## CHIPS

为了应对这种问题，`Chrome` 提出了具有独立分区状态的 `Cookie` (`CHIPS`) ，它允许开发者将 `Cookie` 选择到“分区”存储中，每个顶级站点都有单独的 `Cookie jar`。

> `Chrome` 官方是这样描述它的：`CHIPS` 是帮助服务顺利过渡到没有第三方 `Cookie` 的未来的重要一步。

`CHIPS` 引入了一个新的 `Cookie` 属性：`Partitioned` ，它可以让顶级上下文分决定哪些 `Cookie` 进行分区。

还是上面的例子，我们在站点 `A` 中通过 `iframe` 嵌入了一个站点 `C`，正常情况下如果三方 `Cookie` 被禁用后，`C` 是无法在 `A` 站点访问到它的 `Cookie` 的。

如果 `C` 在它的 `Cookie` 上指定了 `Partitioned` 属性，这个 `Cookie` 将保存在一个特殊的分区 `jar` 中。它只会在站点 `A` 中通过 `iframe` 嵌入站点 `C` 时才会生效，浏览器会判定只会在顶级站点为 `A` 时才发送该 `Cookie`。


当用户访问一个新站点时，例如站点 `B`，如果也它通过 `iframe` 嵌入了站点 `C`，这时在站点 `B` 下的站点 `C` 是无法访问到之前在 `A` 下面设置的那个 `Cookie` 的。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cca9293d013a4af096a5bc15fcddf445~tplv-k3u1fbpfcp-zoom-1.image)

如果用户直接访问站点 `C` ，一样也是访问不到这个 `Cookie` 的。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e348c03d234c41edba5d4c0a3844fb40~tplv-k3u1fbpfcp-zoom-1.image)


这就在保护了用户隐私的情况下完美的解决了 `iframe` 页面三方 `Cookie` 的问题，完美 ～

下面是启用了 `CHIPS` 后 `Cookie` 的分区键的变化：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fe6713aa477c47e69f4fa46a55397b65~tplv-k3u1fbpfcp-zoom-1.image)


## 试用

`CHIPS` 将在 `Chrome 100` 到 `103` 版本启动试用版本！

如果想在本地试用，可以在 `Chrome Canary` 中打开 `chrome://flags/#partitioned-cookies` 标志：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/670fc9b8afd14fee81412af71b72e1c5~tplv-k3u1fbpfcp-zoom-1.image)


> 完整提案：https://github.com/WICG/CHIPS

和 `SameParty` 一样，`CHIPS` 也是其实也是解决三方 `Cookie` 问题众多提案中的一个，因为 `Cookie` 的改动影响太大，谁能最终脱颖而出成为各大浏览器的通用方案还不好说，我们后续拭目以待吧～，有新的方案出来我会第一时间为大家解读！


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
