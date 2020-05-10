---
title: 两个你必须要知道的 Chrome 80 策略更新！！！
date: 2019-12-28 11:11:00
---


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200220202415.png)

`Chrome 80` 版本在 2020年2月份 正式发布了，随后又陆续更新了几个小版本，本次升级主要是更新了安全修复和稳定性改进以及用户体验优化。

如果你是一个Web站点维护者、其中的两项更新你一定要关注，因为下面这两项更新可能导致你站点的现有的功能不能正常运行；你需要及时排查站点是否存在问题并且做出对应的修复策略。

## 1.混合内容强制 HTTPS

混合内容是指 `https` 页面下有非 `https` 资源时，浏览器的加载策略。

在 `Chrome 80` 中，如果你的页面开启了 `https`，同时你在页面中请求了 `http` 的音频和视频资源，这些资源将将自动升级为 `https` ，并且默认情况下，如果它们无法通过`https` 加载，`Chrome` 将阻止它们。这样就会造成一些未支持 `https` 协议的资源加载失败。

如果你想临时访问这些资源，你可以通过更改下面的浏览器设置来访问：

1.单击地址栏上的锁定图标并选择 “站点设置”：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200220203516.png)

2.将 "隐私设置和安全性" 中的 "不安全内容" 选择为 "允许"：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200220203557.png)

你还可以通过设置 `StricterMixedContentTreatmentEnabled` 策略来控制这些变化：

> 此策略控制浏览器中混合内容（HTTPS站点中的HTTP内容）的处理方式。如果该政策设置为true或未设置，则音频和视频混合内容将自动升级为HTTPS（即，URL将被重写为HTTPS，如果资源不能通过HTTPS获得，则不会进行回退），并且将显示“不安全”警告在网址列中显示图片混合内容。如果该策略设置为false，则将禁用音频和视频的自动升级，并且不会显示图像警告。该策略不影响音频，视频和图像以外的其他类型的混合内容。

但是以上策略是一个临时策略，将在 `Chrome 84` 中删除。更合理的方式是你需要推动全站资源开启 `HTTPS`、`Chrome` 也是推荐大家这么做的。


## 2.强推 SameSite Cookie 


`SameSite` 是 `Chrome 51` 版本为浏览器的 `Cookie` 新增的了一个属性， `SameSite` 阻止浏览器将此 `Cookie` 与跨站点请求一起发送。其主要目标是降低跨源信息泄漏的风险。同时也在一定程度上阻止了 `CSRF`（Cross-site request forgery 跨站请求伪造）。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200220211009.png)

`Cookie` 往往用来存储用户的身份信息，恶意网站可以设法伪造带有正确 `Cookie` 的 `HTTP` 请求，这就是 `CSRF` 攻击。

`SameSite` 可以避免跨站请求发送 `Cookie`，有以下三个属性：

### Strict

`Strict` 是最严格的防护，将阻止浏览器在所有跨站点浏览上下文中将 `Cookie` 发送到目标站点，即使在遵循常规链接时也是如此。因此这种设置可以阻止所有 `CSRF` 攻击。然而，它的用户友好性太差，即使是普通的 `GET` 请求它也不允许通过。

例如，对于一个普通的站点，这意味着如果一个已经登录的用户跟踪一个发布在公司讨论论坛或电子邮件上的网站链接，这个站点将不会收到 `Cookie` ，用户访问该站点还需要重新登陆。

不过，具有交易业务的网站很可能不希望从外站链接到任何交易页面，因此这种场景最适合使用 `strict` 标志。


### Lax

对于允许用户从外部链接到达本站并使用已有会话的网站站，默认的 `Lax` 值在安全性和可用性之间提供了合理的平衡。 `Lax` 属性只会在使用危险 `HTTP` 方法发送跨域 `Cookie` 的时候进行阻止，例如 `POST` 方式。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200220211236.png)

例如，一个用户在 A站点 点击了一个 B站点（GET请求），而假如 B站点 使用了`Samesite-cookies=Lax`，那么用户可以正常登录 B 站点。相对地，如果用户在 A 站点提交了一个表单到 B站点（POST请求），那么用户的请求将被阻止，因为浏览器不允许使用 `POST` 方式将 `Cookie` 从A域发送到Ｂ域。

### None

浏览器会在同站请求、跨站请求下继续发送 `Cookies`，不区分大小写。

### 策略更新

在旧版浏览器，如果 `SameSite` 属性没有设置，或者没有得到运行浏览器的支持，那么它的行为等同于 `None`，`Cookies` 会被包含在任何请求中——包括跨站请求。

但是，在 `Chrome 80+` 版本中，`SameSite` 的默认属性是 `SameSite=Lax`。换句话说，当 `Cookie` 没有设置 `SameSite` 属性时，将会视作 `SameSite` 属性被设置为`Lax` 。如果想要指定 `Cookies` 在同站、跨站请求都被发送，那么需要明确指定 `SameSite` 为 `None`。具有 `SameSite=None` 的 `Cookie` 也必须标记为安全并通过 `HTTPS` 传送。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200220210917.png)

如果你的 `Cookie` 未能正确配置。以下是 `Chrome 80` 和早期的 `Chrome`（77 以上）版本中开发者工具控制台的警告：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200220210758.png)

在 `Chrome 88` 之前，您将能够使用策略还原为旧版 `Cookie` 行为。您可以使用 `LegacySameSiteCookieBehaviorEnabledForDomainList` 指定受信任的域，也可以使用 `LegacySameSiteCookieBehaviorEnabled` 控制全局默认值。有关更多详细信息，请访问 `Cookie旧版SameSite政策`：https://www.chromium.org/administrators/policy-list-3/cookie-legacy-samesite-policies。

以上更新可能对以下功能造成影响：

- 1. 跨域名登陆失效
- 2. `jsonp` 获取数据失效
- 3. `iframe` 嵌套的页面打不开或异常
- 4. 部分客户端未改造导致各种数据获取异常

建议大家针对上述更新对自己的站点功能在新版浏览器下做一些测试，以免影响功能正常使用。

你可以到 `chrome://flags/` 开启 `SameSite by default cookies`、`Cookies without SameSite must be secure` 进行测试。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200220210625.png)
