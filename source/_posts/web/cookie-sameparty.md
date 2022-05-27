---
title: 详解 Cookie 新增的 SameParty 属性
category: Web
tag:
- 最新提案
- 浏览器策略
- Cookie
- Web安全
date: 2021-08-30
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

各大主流浏览器正在逐步禁用 `三方Cookie` ，之前笔者也在下面这篇文章中分析了全面禁用 `三方Cookie` 后对我们的网站带来的一些影响：

[当浏览器全面禁用三方 Cookie](https://mp.weixin.qq.com/s?__biz=Mzg2NDAzMjE5NQ==&mid=2247485523&idx=1&sn=e7f3989448f5ff1e8905fc6596268e33&chksm=ce6eccfff91945e990e0b21e777f5a85f3f0699f7d51e45a1dd83d0bf36eaf926f7e90fbe3ff&token=379611469&lang=zh_CN#rd)

但是一个公司或组织往往在不同业务下会有多个不同的域名，例如 `taobao.com`、`tianmao.com`，所以很多正常的业务场景也许要借助 `三方Cookie`  来实现（比如 `单点登录 `和 `consent管理`），直接禁用后可能会给我们的业务带来很大影响，而且之前一直以来都没有很好的解决方案，这也是 Chrome 禁用 `三方Cookie` 进展非常缓慢的原因。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6824dcf843a494eaa60c833139eb9c9~tplv-k3u1fbpfcp-zoom-1.image)


在 `第一方Cookie` 和 `第三方Cookie` 被区别对待的情况下，Chrome 新推出了一个 `First-Party Sets` 策略，它可以允许由同一实体拥有的不同关域名都被视为第一方。

这意味着我们可以标记打算在同一方上下文共享 `Cookie` 的不同域名，目的是在防止第三方跨站点跟踪和仍然保持正常的业务场景下之间找到平衡。

> 目前 `First-Party Sets` 策略还没有正式在稳定版推出，还在试用阶段。

## 一方和三方 Cookie 的区别

可能很多小伙伴对 `三方Cookie` 的概念还比较模糊，我们先来回顾一下：

`Cookie` 本质上不区分第一方或第三方，它取决于包含 `Cookie` 的当前上下文。我们还用之前的老例子：

如果是你正常的正在逛着天猫，天猫会把你的信息写入一些 `Cookie` 到 `.tmall.com` 这个域下，然而打开控制台你会看到，并不是所有 `Cookie` 都是  `.tmall.com` 这个域下的，里面还有很多其他域下的  `Cookie` ，这些所有非当前域下的 `Cookie` 都属于第三方 `Cookie`，虽然你可能从来没访问过这些域，但是他们已经悄悄的通过这些第三方 `Cookie`来标识你的信息，然后把你的个人信息发送过去了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/726dc8ecd8184ae187b4f96b44a61a72~tplv-k3u1fbpfcp-zoom-1.image)

而 `.tmall.com` 这个域下的 `Cookie` 都属于第一方 `Cookie`，那么为什么还需要第三方 `Cookie` 呢？再打开 `taobao.com`，你会发现你已经不需要再登录了，因为淘宝、天猫都属于阿里旗下的产品，阿里为他们提供统一的登录服务，同时，你的登录信息也会存到这个统一登录服务的域下，所以存到这个域下的 `Cookie` 就成了三方 `Cookie`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b01cfbe85796425284d64cb8dff64247~tplv-k3u1fbpfcp-zoom-1.image)

## SameSite 的问题

`Chrome` 在之前的版本为 `Cookie` 新增了一个 `SameSite` 属性 来限制三方 `Cookie` 的访问，在 `Chrome 80` 版本后 `SameSite` 的默认值被设定为 `SameSite=Lax`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0829257206d940d3b6869b27cea05437~tplv-k3u1fbpfcp-zoom-1.image)


在 `Strict` 模式下，将阻止所有三方 Cookie 携带，这种设置基本可以阻止所有 CSRF 攻击，然而，它的友好性太差，即使是普通的 GET 请求它也不允许通过。

在 `Lax` 模式下只会阻止在使用危险 `HTTP` 方法进行请求携带的三方 `Cookie`，例如 `POST` 方式。同时，使用 `JavaScript` 脚本发起的请求也无法携带三方 `Cookie`。


但是，试用上面两种模式，我们上面提到的一些正常的需求场景就无法实现了，对于这种 `Cookie` ，我们现在一般会手动设置 `SameSite=None` 。

这意味着这种 `Cookie` 又失去了跨站点请求伪造 (`CSRF`) 保护，例如在 `evil.site` 发送一个 `me.site` 的请求，也会带上我们的 `Cookie`。


## `First-Party Sets` 策略

在上面正常的业务场景中，所有不同的域名基本上都来自同一个组织或企业，我们希望在同一个运营主体下不同域名的 `Cookie` 也能共享。

`First-Party Sets` 可以定义跨站点上下文仍然是 `first-party` 的情况。 `Cookie` 可以包含在第一方集合中，也可以排除在第三方上下文中。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cabf7293fd3e4d8c977dd09d0e6d67b2~tplv-k3u1fbpfcp-zoom-1.image)

`First-Party Sets` 提出了一种明确定义在同一主体下拥有和运营的多个站点关系的方法。比如  `.tmall.com`、`taobao.com` 都可以被定义为同一主体运营 。

> 这个策略来源于浏览器的隐私沙提案中对身份进行分区以防止跨站点跟踪的概念，在站点之间划定界限，限制对可用于识别用户的任何信息的访问。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bf47315e60345f7b1facb0a199042cd~tplv-k3u1fbpfcp-zoom-1.image)

浏览器的默认行为是对同一站点进行分区，上面这个新的策略意味着分区被可以开放为多个站点。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f578c87a40642f3a09e1b0f8cf6f82a~tplv-k3u1fbpfcp-zoom-1.image)

`First-Party Sets` 策略的一个重要部分是确保跨浏览器的政策防止滥用或误用。例如，`First-Party Sets` 策略不得在不相关的站点之间交换用户信息，或对不属于同一实体的站点进行分组。

所以单点登录这种场景可能是不能用这种方式解决了，因为这个场景属于交换用户信息，目前怎么界定哪些信息是用户信息官方还没有明确的描述，所以这个地方笔者也不是很确定。

> `W3C` 目前正在讨论新的 `First-Party Sets` 的配置和验证，其中一个考虑的选项是由独立实体而非浏览器公司处理验证。

目前 `First-Party Sets` 已经确定的原则如下：

- `First-Party Sets` 中的域必须由同一组织拥有和运营。
- 所有域名应该作为一个组被用户识别。
- 所有域名应该共享一个共同的隐私政策。

## 如何定义 `First-Party Sets` 

每一个需要用到  `First-Party Sets` 策略的域名都应该把一个 `JSON` 配置托管在 `/.well-known/first-party-set` 路由下。

例如 `conardli.top` 的配置应该托管在 `https://conardli.top/.well-known/first-party-set` 下：

```json
{
  "owner": "conardli.top",
  "version": 1,
  "members": ["conardli.com", "conardli.cn"]
}
```

另外 `conardli.com、 conardli.cn` 两个域名均需要增加所有者的配置：
```json
{
  "owner": "conardli.top"
}
```


`First-Party Sets` 还有一些限制：
 
- 一个集合可能只有一个所有者。
- 一个成员只能属于一个集合，不能重叠或混合。
- 域名列表不要过大。

## SameParty 属性

好了，上面介绍了一大堆，终于回到本文的主题 `Cookie SameParty` 属性了，这个属性就是为了配合 `First-Party Sets`  使用的。
 
所有开启了  `First-Party Sets` 域名下需要共享的 `Cookie` 都需要增加 `SameParty` 属性，例如，如果我在 `conardli.top` 下设置了下面的 `Cookie` ：

```js
Set-Cookie: name=lishiqi; Secure; SameSite=Lax; SameParty
```

这时我在 `conardli.cn` 下发送 `conardli.top` 域名的请求，`Cookie` 也可以被携带了，但是如果我在另外一个网站，例如 `eval.site` 下发送这个请求， `Cookie` 就不会被携带。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bb2c7d9fa26d464fbcb069e026eba8b8~tplv-k3u1fbpfcp-zoom-1.image)


在 `SameParty` 被广泛支持之前，你可以把它和 `SameSite` 属性一起定义来确保 `Cookie` 的行为降级，另外还有一些额外的要求：

- SameParty Cookie 必须包含 Secure.
- SameParty Cookie 不得包含 SameSite=Strict.


## 如何试用？

在浏览器禁用三方 Cookie 后，这个新的提案应该会被大范围的使用，现在可以先试用起来啦！

你可以在下面两个地方参与提案的讨论：

- First-Party Sets 策略讨论：https://github.com/privacycg/first-party-sets
- SameParty 属性讨论： https://github.com/cfredric/sameparty

现在提案还在试用阶段，你可以试用 `--use-first-party-set` 这个命令启动 `Chrome` ，就可以进行试用啦！

比如，在示例站 `https://fps-member1.glitch.me/` 添加如下配置：

```JS
--use-first-party-set=https://fps-member1.glitch.me,https://fps-member2.glitch.me,https://fps-member3.glitch.me
```


## 参考 


- https://www.chromestatus.com/feature/5280634094223360
- https://github.com/cfredric/sameparty
- https://developer.chrome.com/blog/first-party-sets-sameparty/


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。

