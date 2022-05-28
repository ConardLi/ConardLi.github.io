---
title: 当浏览器全面禁用三方 Cookie
category: Web
tag: 
- Web安全
- 浏览器策略
- Cookie
date: 2020-07-30
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。





苹果公司前不久对 `Safari` 浏览器进行一次重大更新，这次更新完全禁用了第三方 `Cookie`，这意味着，默认情况下，各大广告商或网站将无法对你的个人隐私进行追踪。而微软和 `Mozilla` 等也纷纷采取了措施禁用第三方 `Cookie`，但是由于这些浏览器市场份额较小，并没有给市场带来巨大的冲击。

从 `2017` 年截至 `2019` 年底， `Google` 面临的罚款总额已经超过 93 亿欧元，其中一大原因便是侵犯用户数据隐私。迫于巨大压力，`Google Chrome` 官方团队前不久也宣布，为了提升用户隐私和安全，未来两年将完全禁用第三方 `Cookie`。

在完全不能写入三方 `Cookie` 的情况下，将会对前端的数据读写方式，甚至是整个广告行业带来巨大影响。

## Cookie 的意义

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad957a3177f94080a336294a14296570~tplv-k3u1fbpfcp-zoom-1.image)

众所周知，`HTTP` 协议是无状态的协议，如果你在同一个客户端向服务器发送多次请求，服务器不会知道这些请求来自同一客户端。

这正是 `HTTP` 协议得以广泛应用的原因，试想一下，如果它是有状态协议，你必须要时刻与服务器建立链接，那么如果连接意外断开，整个会话就会丢失，重新连接之后一般需要从头开始；而如果是无状态协议，使得会话与连接本身独立起来，这样即使连接断开了，会话状态也不会受到严重伤害，保持会话也不需要保持连接本身。

如果 `HTTP` 协议只是用来访问静态文件，那不会有任何问题，但是如果你要为广大用户提供更好的服务，服务器就需要知道每个请求具体来自于哪个用户，比如你在逛淘宝的时候你只需要登录一次，当你发起一次购买请求，服务器就已经知道你登录过了，不会再让你进行登录。

所以 `HTTP` 协议需要占用浏览器的一小块存储，存储当前访问用户的一些 ”状态“，然后每次发起 `HTTP` 请求，请求中就会携带这些状态，从而让服务器知道你是谁。`Cookie` 出现的的意义就是为了解决这个问题，让无状态的 `HTTP` 协议拥有一小块记忆。

但是， `Cookie` 一经出现，就成了各大广告和购物网站窥探用户隐私的利器，他们使用第三方 `Cookie` 不断获取你的数据，那么什么第三方 `Cookie` 呢？

## 第三方 Cookie

如果是你正常的正在逛着天猫，天猫会把你的信息写入一些 `Cookie` 到 `.tmall.com` 这个域下，然而打开控制台你会看到，并不是所有 `Cookie` 都是 `.tmall.com` 这个域下的，里面还有很多其他域下的 `Cookie` ，这些所有非当前域下的 `Cookie` 都属于第三方 `Cookie`，虽然你可能从来没访问过这些域，但是他们已经悄悄的通过这些第三方 `Cookie`来标识你的信息，然后把你的个人信息发送过去了。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/71627915cb8548558b4e8bc230dd16e8~tplv-k3u1fbpfcp-zoom-1.image)

而 `.tmall.com` 这个域下的 `Cookie` 都属于第一方 `Cookie`，那么为什么还需要第三方 `Cookie` 呢？再打开 `taobao.com`，你会发现你已经不需要再登录了，因为淘宝、天猫都属于阿里旗下的产品，阿里为他们提供统一的登录服务，同时，你的登录信息也会存到这个统一登录服务的域下，所以存到这个域下的 `Cookie` 就成了三方 `Cookie`。

我们再打开已经完全禁用了第三方 `Cookie` 的 `Safari`，发现只剩下 `.tmall.com` 这个域下的 `Cookie` 了。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65da2c16383f40db96ed32781d572e08~tplv-k3u1fbpfcp-zoom-1.image)

这时你会发现即使你已经登录了天猫，再访问淘宝也还是需要登录的，你已经无法享用这样的功能了，而三方 `Cookie` 可不仅仅就这么点用途，在 `Web` 开发中，三方 `Cookie` 的应用非常之广，下面我们再来具体看几个应用场景：

## 三方Cookie的用途

### 前端日志打点

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1fa084d434354ca59ea142ccd56beb40~tplv-k3u1fbpfcp-zoom-1.image)

大多数 `Web` 站点都会引用一些第三方 `SDK` 来进行前端异常或性能监控，这些 `SDK` 会通过一些接口将监控到的信息上传到他们的服务器。一般它们都需要标识每个用户来方便排查问题或者统计 `UV` 数据，所以当你一此请求这个站点的时候，它们可能会在你的站点上 `set` 一个 `Cookie`，后续所有的日志上报请求都会带上这个 `Cookie` 。

由于一般这些第三方 `SDK` 都是用于监控的通用服务，它们肯定会拥有自己独立的域名，比如 `log.com`，它在你的域名 `mysite.com` 下种下的 `Cookie` 就属于第三方 `Cookie`。

### 广告营销神器 - Facebook Pixel

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4bf6fa43032f4fd99771bc3c4d12539b~tplv-k3u1fbpfcp-zoom-1.image)

在电商业务中，追踪流量、导流量、转换率、销售额这些都是商家最关心的问题。这时候你就可以使用 `Facebook Pixel`，简单来说 `Facebook Pixel` 像素就是一串 `JavaScript` 代码，可以追踪广告的转化量、改进受众定位、使广告花费回报最大化。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8eb754675034485bdf39d4783a9d30d~tplv-k3u1fbpfcp-zoom-1.image)

当访客进入到被设有 `Facebook Pixel` 的页面时，便会触发这段代码。比如，查看了商品或者加入购物车， `Facebook Pixel` 便会向系统发送请求来记录这些行为，系统可以利用这些收到的行为信息进一步的做追踪和优化。

举一个实际例子，我们进入一个国外的电商网站 `Brava Fabrics` ，你会发现已经被写入了一堆 `facebook.com` 下的三方 `cookie`：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66ed7312869d406080a2d38fdd51b298~tplv-k3u1fbpfcp-zoom-1.image)

我猜测这个 `fr` 应该就是用来标识我身份信息的 `cookie`，然后点击几个页面，在 `network` 里面找到了几个 `facebook` 发送的请求，下面是其中一个：

```
https://www.facebook.com/tr/?id=382444918612794&ev=PageView&dl=https%3A%2F%2Fbravafabrics.com%2Fcollections%2Fa-moment-of-bliss&rl=https%3A%2F%2Fbravafabrics.com%2F&if=false&ts=1586868288778&sw=1680&sh=1050&ud[ct]=eb045d78d273107348b0300c01d29b7552d622abbc6faf81b3ec55359aa9950c&ud[country]=eb045d78d273107348b0300c01d29b7552d622abbc6faf81b3ec55359aa9950c&v=2.9.15&r=stable&ec=0&o=30&fbp=fb.1.1586867082370.951509876&it=1586868284974&coo=false&rqm=GET
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ee9ca7126f3b42dd8a321adc1c4a2027~tplv-k3u1fbpfcp-zoom-1.image)

查看详情你会发现，有下面几个主要的参数：

```
dl: https://bravafabrics.com/collections/a-moment-of-bliss
rl: https://bravafabrics.com/
```

这时 `facebook` 已经知道了我从 `https://bravafabrics.com/` 来到了 `https://bravafabrics.com/collections/a-moment-of-bliss` 这个页面，同时，这个请求会携带 `fr=09wX7ui8MrvCh2SIa..BdNoGz.f.F6R.0.0.Belanb.AWXCDx` 这个 `Cookie`。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8ddbc75c2e04dde9113ed85bfe57f0e~tplv-k3u1fbpfcp-zoom-1.image)

来到 `facebook`，当你登录后，`facebook` 会把刚刚这些 `Cookie` 和你的 `facebook Id` 关联起来，然后他就可以好好的分析你的行为了：

-   有人在你的网站上完成了购买。
-   有人注册进行试用，或者以其他方式将自己标识为你网站上的潜在客户。
-   有人在你网站上的购买过程中输入他们的付款信息。
-   有人将产品添加你网站上的购物车中。
-   有人选择特定版本的产品，例如选择某种颜色。
-   有人发起了结账，但没有付款
-   ...

而如此强大的追踪能力，只需要你复制一段 `Facebook Pixel` 的 `JavaScript` 脚本到你的页面上就可以了。而这一切能力就建立在一个小小的 `Cookie` 的基础上，因为有了这个 `Cookie` ，`Facebook` 才能将这些行为与它的账号体系进行关联。

### 无处不在的的 mmstat

再来看一个我们国内的例子，平时我们在国内的搜索引擎或视频网站上搜索到一些东西，然后打开购物网站就可以收到各种你兴趣的相关推荐，这已经是大众习以为常的事情了，各大购物网站、广告商，会通过第三方 `Cookie` 收集你的年龄、性别、浏览历史等从而判断你的兴趣喜好，然后带给你精准的信息推荐。

比如，我们在浏览百度、优酷、天猫等网站时，都能看到几个 `.mmstat.com` 这个域下的 `Cookie`

百度：![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/76a2eecf39ae4d5dbaed9d918d496346~tplv-k3u1fbpfcp-zoom-1.image)

优酷：![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b787d4389f0f4eddb2cd8362fe38b457~tplv-k3u1fbpfcp-zoom-1.image)

天猫：![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc9a41302cff462cb29c340d87dc8cf8~tplv-k3u1fbpfcp-zoom-1.image)

当你在百度、优酷、淘宝等进行一系列的操作时，`.mmstat.com` 已经悄悄的通过三方 `Cookie` 把你的个人信息运送到了他们那边。`.mmstat.com` 应该就是阿里旗下的大数据营销平台阿里妈妈旗下的域名（只是个人猜测）。打开阿里妈妈首页，可以看到，其号称是更懂消费者的数据金矿，已经建立起5亿用户的身份识别体系。你的每一次搜索、每一次购买、都会让它变的更精准，下一次你就收到更精准的推荐。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5e63fd69c42e4232a7163fdc89d219e8~tplv-k3u1fbpfcp-zoom-1.image)

当然，三方 `Cookie` 只是众多获取你喜好信息的一种方式，只不过这种方式更便捷，成本更低。

## 浏览器的策略

最近几大浏览器针对 `Cookie` 策略的频繁改动，意味着三方 `Cookie` 被全面禁用已经不远了：

### Firefox、Safari —— 默认禁用

在 `Safari 13.1`、`Firefox 79` 版本中，三方 `Cookie` 已经被默认禁用，但是由于这些游览器市场份额较小，并没有给市场带来巨大的冲击。因为阿里的登录信息是统一存在一个三方 `Cookie` 下的，淘宝刚开始的处理方式，甚至是弹个框出来，告诉用户手动开启三方 `Cookie` ：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9610329ac3db4e07b8009b80f733e4a0~tplv-k3u1fbpfcp-zoom-1.image)

但是这样的处理方式对于庞大的用户来讲肯定体验是极低的，解决方案可能是先将 `Cookie` 种在当前域下，所有就有了我们上面的测试结果，淘宝、天猫两个网站需要登录两次。

但是三方 `Cookie`做的事情远不止这些，等到 `Chrome` 全面禁用之前，一定要提前作出改变。

### Chrome —— SameSite Cookie

还好由于三方 `Cookie` 对 `Google` 的广告业务影响较大，所以其没有立即进行禁用，而是一直陆续修改一些小的策略来对三方 `Cookie` 进行限制，比如 `SameSite`

`SameSite` 是 `Chrome 51` 版本为浏览器的 `Cookie` 新增的了一个属性， `SameSite` 阻止浏览器将此 `Cookie` 与跨站点请求一起发送。其主要目标是降低跨源信息泄漏的风险。同时也在一定程度上阻止了 `CSRF` 攻击。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a2bd7bde47f417e83c474ef3df11b62~tplv-k3u1fbpfcp-zoom-1.image)

`SameSite` 可以避免跨站请求发送 `Cookie`，有以下三个属性：

#### Strict

`Strict` 是最严格的防护，将阻止浏览器在所有跨站点浏览上下文中将 `Cookie` 发送到目标站点，即使在遵循常规链接时也是如此。因此这种设置可以阻止所有 `CSRF` 攻击。然而，它的用户友好性太差，即使是普通的 `GET` 请求它也不允许通过。

例如，对于一个普通的站点，这意味着如果一个已经登录的用户跟踪一个发布在公司讨论论坛或电子邮件上的网站链接，这个站点将不会收到 `Cookie` ，用户访问该站点还需要重新登陆。

不过，具有交易业务的网站很可能不希望从外站链接到任何交易页面，因此这种场景最适合使用 `strict` 标志。

#### Lax

对于允许用户从外部链接到达本站并使用已有会话的网站站，默认的 `Lax` 值在安全性和可用性之间提供了合理的平衡。`Lax` 属性只会在使用危险 `HTTP` 方法发送跨域 `Cookie` 的时候进行阻止，例如 `POST` 方式。同时，使用 `JavaScript` 脚本发起的请求也无法携带 `Cookie`。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e17aa4d8a8a840ca8bb9f1310bc51183~tplv-k3u1fbpfcp-zoom-1.image)

例如，一个用户在 A 站点 点击了一个 B 站点（GET请求），而假如 B 站点 使用了`Samesite-cookies=Lax`，那么用户可以正常登录 B 站点。相对地，如果用户在 A 站点提交了一个表单到 B站点（POST请求），那么用户的请求将被阻止，因为浏览器不允许使用 `POST` 方式将 `Cookie` 从A域发送到Ｂ域。

#### None

浏览器会在同站请求、跨站请求下继续发送 `Cookies`，不区分大小写。

#### 策略更新

在旧版浏览器，如果 `SameSite` 属性没有设置，或者没有得到运行浏览器的支持，那么它的行为等同于 `None`，`Cookies` 会被包含在任何请求中——包括跨站请求。

但是，在 `Chrome 80+` 版本中，`SameSite` 的默认属性是 `SameSite=Lax`。换句话说，当 `Cookie` 没有设置 `SameSite` 属性时，将会视作 `SameSite` 属性被设置为`Lax` 。如果想要指定 `Cookies` 在同站、跨站请求都被发送，那么需要明确指定 `SameSite` 为 `None`。具有 `SameSite=None` 的 `Cookie` 也必须标记为安全并通过 `HTTPS` 传送。这意味着所有使用 `JavaScript` 脚本收集用户信息的请求默认将不能携带三方 `Cookie`。

然而这个改动并不会造成太大的影响，它只是给各大网站提了一个信号，因为你只需要把你想要发送的 `Cookie` 的属性手动设置为 `none` 即可：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/496bbe2c061f40e6854749e255517359~tplv-k3u1fbpfcp-zoom-1.image)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2248c04c41374f2baef56070297c25a0~tplv-k3u1fbpfcp-zoom-1.image)

真正可怕的是我们将无法直接指定 `SameSite` 为 `None`，只能用户自己去选择，这才是真正的默认禁用。

`Chrome` 也宣布，将在下个版本也就是 `Chrome 83` 版本，在访客模式下禁用三方 `Cookie`，在 `2022` 年全面禁用三方 `Cookie`，到时候，即使你能指定 `SameSite` 为 `None` 也没有意义，因为你已经无法写入第三方 `Cookie` 了。

## 当三方 Cookie 被全面禁止

现在，我们想象一下，当浏览器禁用了三方 `Cookie`，而我们又没有作出任何改变的情况下，会发生什么：

### 前端日志异常

可能有一天你会突然发现，你的 `UV` 暴涨，但是 `PV` 却没有什么变化，那可能是你的打点 `SDK` 使用的三方 `Cookie` 被禁用掉了。

这时这个 `SDK` 将无法在你的域下写入一个三方 `Cookie`，导致你的每次刷新页面它都会带一个新的 `Cookie` 回来，后端接受到的信号就是这些都是不同用户的请求，所以都会计入 `UV`。同时你在排查问题时，你也无法将用户的行为串联起来，导致排查非常困难。

### 智能广告推荐消失

上面我们提到，广告服务通过你的年龄、性别、行为来推断你的喜好，从而推送给你精准的广告，使用了三方 `Cookie` 来进行信息追踪的广告主将无法获得你的这些喜好，从而无法推荐给你感兴趣的广告。

这时，广告主只能在你当时的访问环境进行预定义广告，比如你正在访问宠物网站，就给你推荐宠物用品等等。

同时，可能之前广告主还会通过 `Cookie` 判断你阅读某个广告的次数，一旦你阅读同一个广告多次但是没有发生转化，其就会停止向你推送该广告。或者你已经购买过了这个商品，那你也不会再看到这个广告了。如果没有了频率控制，那么你可能要连续很多天盯着一个你永远也不会去点的广告，或者你会持续看到一个你已经购买过的产品广告。

### 无法追踪转化率

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02fd48a6d1eb4a29b00c1e52fa2545cd~tplv-k3u1fbpfcp-zoom-1.image)

当你查看一则广告时，该广告会在你的浏览器中放置一个 `Cookie`，表示你已经看到它。如果随后你进入转化阶段（购买、下载等），广告主们需要能追踪每一个他们投放到你网站上的转化率，这样他们才能计算投放的效果，从而作出优化策略，如果你无法再追踪广告转化率了，那么也很难再进行投放了。

当然，以上只是建立在你没有进行任何改变的基础上，距离全面禁用三方 `Cookie` 还有一年多的时间，这应该是一个足够的时间让你及时作出应对。

### 是好是坏

虽然，这对你带来的可能是糟糕的广告体验，但是全面禁用三方 `Cookie` 对我们用户来讲肯定是一件好事，因为你的信息不会被轻而易举的就被别人追踪了，你的隐私信息也不会容易被泄漏。

然而事情真的那么简单么？贪婪的广告商绝对不会直接放弃对你的信息追踪，首先他们已经对你掌握了足够多的信息，而且三方 `Cookie` 只是众多获取你信息的一种手段，只不过这种方法更方便简单，为了利益，他们一定会找到更多的替代方案：

## 使用一方 Cookie 替代 三方 Cookie

如果我们引入了一个三方的 `SDK`，比如 `google analytics` ，说明我们对其是信任的，它对我们的信息收集追踪都是在允许范围内的。所以这些 `SDK` 依然可以使用第一方 `Cookie` 来完成用户身份标识符。

比如，`gtag.js` 和 `analytics.js` 会设置以下 `Cookie` 用户标识用户信息：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d23bd981ccd345a4b1729b85f83f5bb2~tplv-k3u1fbpfcp-zoom-1.image)

但是，这些 `Cookie` 并不是第三方 `Cookie`，而是设在你的域下的第一方 `Cookie`，比如打开 `twitter` 的 `Cookie` 信息：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f077c2276dc44b7b247827947fcd65a~tplv-k3u1fbpfcp-zoom-1.image)

我们发现 `_ga` 、`_gid` 这两个 `Cookie` 正是设置在其自己域下面的。

如果使用正常的 `Set-Cookie` 的形式，`google analytics` 是无法直接将 `Cookie` 设置到 `twitter.com` 这个域下面的，而且 `google analytics` 发起的日志收集请求也无法携带 `twitter.com` 这个域下的 `Cookie`。

打开 `sdk` 的代码我发现里面有使用 js 设置 `Cookie` 的代码：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/162f491cf7d14aceb2e7a73834375a63~tplv-k3u1fbpfcp-zoom-1.image)

并且，收集日志的请求中也又没携带任何 `Cookie`，而是把这信息带在了参数中：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/78d19a43e45a4f57801c8c8eacaa07a0~tplv-k3u1fbpfcp-zoom-1.image)

这样的方式就模拟了使用三方 `Cookie` 标识用户信息的过程，并且完全可以替代它。总而言之禁用三方 `Cookie` 对这种三方 `SDK` 的影响并不大，只要稍微改变一下思维即可。

当然，由于 `Safari` 和 `Firefox` 已经全面禁用了三方 `Cookie`，一些广告营销服务也正在给出使用一方 `Cookie` 的替代方案，比如 `Facebook Pixel`：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dab92bf9d9354928b263d785cb2aad75~tplv-k3u1fbpfcp-zoom-1.image)

你允许了其读取一方 `Cookie` 就意味着它能获取你更多的数据，这意味着你需要承担更大的用户信息泄漏的风险。而且使用一方 `Cookie` 也不像使用三方 `Cookie` 那样灵活，在某些场景下也是有很大限制的。

## 浏览器指纹

三方 `Cookie` 的主要作用是标识你的身份，从而在你下一次访问时知道你是谁，那么如果有一种技术直接就可以获取你的唯一标识时，那么就不需要再存储 `Cookie` 了，这个技术就是 “浏览器指纹” 。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a74851ccd2c548ef960b6408e11eefc3~tplv-k3u1fbpfcp-zoom-1.image)

“浏览器指纹”是一种通过浏览器对网站可见的配置和设置信息来跟踪 `Web` 浏览器的方法，浏览器指纹就像我们人手上的指纹一样，每个人拥有一份接近于独一无二的配置。

如果单单拿出一个配置来讲可能很多人和你拥有一样的配置，比如下面的：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a5daa7dcce884b989996e2a90f39820e~tplv-k3u1fbpfcp-zoom-1.image)

-   系统版本：
-   -   我的系统版本是 `Mac OS X 10_14_6`
    -   大约 `11.91%` 的人与我的配置相同
    -   大约每 `8` 个人中有一个和我配置相同
-   `Chrome` 版本：
-   -   我使用的浏览器是 `Chrome`，并且版本是：`81.0.4044.92`
    -   大约 `0.08%` 的人与我的配置相同
    -   大约每 `1250` 个人中有一个和我配置相同
-   `UTC+8` 时间：
-   -   我的`UTC+8` 时间是 `2020.4.15 23:00:00`
    -   大约 `2.30%` 的人与我的配置相同
    -   大约每 `43` 个人中有一个和我配置相同

如果单独看每个配置，那他们都不能作为你独一无二的特征，但是综合起来看呢？比如就看这三项，三项的配置与你都相同的人的概率就会大大减小了。以上只是一些简单的特征，比如系统版本，浏览器版本，这些只需要一个简单的 `navigator.userAgent` 属性就可以拿到。

像这样的属性还有非常多个，他们可能来自 `HTTP Header`、`Javascript attributes`、`浏览器插件` 等等

### HTTP Header

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/80529660fc06474ab231d5a6a8f0789f~tplv-k3u1fbpfcp-zoom-1.image)

上面的 `HTTP Header` 中就包含了大量的定制化特性，可以看到每一项配置中与我相同的概率是非常低的，然而这些信息属于普通的浏览器指纹，普通指纹可以理解为容易被发现并且容易修改的部分，而且你也可以轻易的篡改他们，有些配置比如 `User-Agent` 、`language` 使用 `JavaScript` 的 `navigator` 对象获取是最准确而且不会被篡改的。下面还有一些其他常见的 `JavaScript` 属性：

### Javascript attributes

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/72153878ae504d02afd6255275654315~tplv-k3u1fbpfcp-zoom-1.image)

这里面包含一些使用 `Javascript` 很容易获取的一些配置：

-   `Screen width`：屏幕宽度
-   `Screen height`：屏幕高度
-   `Cookies enabled`：是否允许 `Cookie`
-   `Content language`：语言信息
-   `List of fonts`：字体信息
-   `Timezone`：时区信息
-   `Navigator properties：Navigator` 对象中包含的属性信息
-   ...

以上这些信息非常容易获取，而且带有的信息较少，最后生成出来的指纹可能碰撞的概率就越大，实际上通过 `JS` 能获取的远不止这些，下面还有一些重复率非常低的指标：

### Canvas 指纹

`Canvas` 是 `HTML5` 中用于在网页上绘制 `2D` 图形元素。浏览器在绘制图形时，会调用操作系统的绘图接口，即便使用 `Cavans` 绘制相同的元素，但是由于系统的差别，不同浏览器使用了不同的图形处理引擎、不同的图片导出选项、不同的默认压缩级别、对抗锯齿、次像素渲染等算法也不同。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8f3b66c9ce0463a8918f41ed1dffe58~tplv-k3u1fbpfcp-zoom-1.image)

具体获取流程如下：在画布上渲染一些文字，再用 `toDataURL` 转换出来，你就会得到属于你的 `Cavans` 指纹：

```js
    const canvas = document.getElementById("canvas-fingerprint");
    const context = canvas.getContext("2d");
    context.font = "18pt Arial";
    context.textBaseline = "top";
    context.fillText("canvas-fingerprint-test", 2, 2);
    return canvas.toDataURL("image/jpeg");
```

上面的图中可以看到，`Canvas` 指纹和我相同的概率是 `<0.01%` 的，可见这是一个在浏览器指纹中非常重要的指标。

### WebGL

`WebGL` 是一种用于在网页上呈现3D图像的 `JavaScript` 浏览器API。网站可利用 `WebGL` 来识别你的设备指纹：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/67b1ef08a64242e39c2f2dca4fea4b84~tplv-k3u1fbpfcp-zoom-1.image)

-   `WebGL` 报告 —— 完整的 `WebGL` 浏览器报告表是可获取、可被检测的。在一些情况下，它会被转换成为哈希值以便更快地进行分析。
-   `WebGL` 图像 —— 渲染和转换为哈希值的隐藏3D图像。由于最终结果取决于进行计算的硬件设备，因此此方法会为设备及其驱动程序的不同组合生成唯一值。这种方式为不同的设备组合和驱动程序生成了唯一值。

### WebRTC

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/644c4d69c10e4630acc762b9aa8bcbf5~tplv-k3u1fbpfcp-zoom-1.image)

`WebRTC` （网页实时通信，`Web Real Time Communication`），是可以让浏览器有音视频实时通信的能力，通常被需要快速直接连接的网络应用程序所应用。即便你使用了代理，网站也能借此获取你真实的公共和本地IP地址。该插件可被用于泄漏你的本地 `IP` 地址或追踪媒体设备。`WebRTC` 会暴露你的：

-   公共IP地址
-   本地IP地址
-   媒体设备的数量及其哈希值

### CSS

就算用户禁用了 `JavaScript` ，网站也可以通过纯 `CSS` 来获取到一些信息，比如这样：

```js
@media(device-width: 1920px) {
  body {
    background: url("https://example.org/1920.png");
  }
}
```

通过统计 `1920.png` 这个图片的请求日志，便可知道有哪些用户的窗口宽度是 `1920px`。

### UUID 的计算

综合以上的指标特征，可以计算出一个属于你自己的唯一的 `uuid`，这就是你的 "浏览器指纹" 了。当然，计算时不能简单的将上述指标进行叠加，因为某些指标在一些场景下聚合度比较高，每个指标带来的信息量也不相同，一般每个指标都拥有一个自己的 "信息熵" :

> 信息熵（entropy）是接收的每条消息中包含的信息的平均量，熵越高，则能传输越多的信息，熵越低，则意味着传输的信息越少。

在计算 `uuid` 时，一般信息熵较大的指标会拥有较大的权重，这样可以大大降低碰撞率，提高 `uuid` 的准确性。

当然，这些也不用你自己去挨个费劲的去获取了，使用 `clientjs`（`https://github.com/jackspirou/clientjs`） 可以轻而易举的帮你获取这些指标，并最终获取 `uuid`：

```js
// Create a new ClientJS object
const client = new ClientJS();
​
// Get the client's fingerprint id
const fingerprint = client.getFingerprint();
​
// Print the 32bit hash id to the console
console.log(fingerprint);
```

你也可以单独获取这些信息：

```js
  const client = new ClientJS();
  client.getBrowserData();
  client.getFingerprint();
  client.getCustomFingerprint(...);
  client.isCanvas();
  client.getCanvasPrint();
  client.getFlashVersion();
  client.isSilverlight();
  client.getSilverlightVersion();
  // 。。。
```

## 参考

-   <https://zhuanlan.zhihu.com/p/34591096>
-   <https://mp.weixin.qq.com/s/5-oObFPiRP6a5O49YsS9wg>
-   <https://juejin.im/post/5d97fb5ef265da5ba12cdea9>

## 小结

作为一名普通用户，我会感叹，太难了，我很难保护我的个人隐私，收集我信息的平台无处不在，收集我信息的手段也是各种各样。。。

在现实世界里，没有什么会保持不变的。

作为一名开发者，你要时刻保持警惕，有危机意识，第一时间更新你的技术以应对外部环境的变化，否则你就会被淘汰。



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
