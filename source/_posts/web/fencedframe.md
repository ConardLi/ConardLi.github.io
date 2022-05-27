---
title: fencedframe 可以替代 iframe 吗？
category: Web
tag: 
- Web安全
- 浏览器策略
- 最新提案
date: 2022-04-19	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



今天继续聊 [浏览器策略](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0MDMwMzQyOA==&action=getalbum&album_id=2160442714947911680#wechat_redirect) ，这是我 「[浏览器策略解读](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0MDMwMzQyOA==&action=getalbum&album_id=2160442714947911680#wechat_redirect)」 专栏的第 `35` 篇文章了，感谢读者们一如既往的支持！

开门见山，先来个简单的描述：

今天主要介绍的是一个 `HTML` 新的用于嵌入内容的标签：`<fencedframe>`，有点儿类似于 `iframe`。与 `iframes` 不同的是，`<fencedframe>` 会限制与其嵌入上下文的通信，从而允许框架访问跨站点的数据，但是不与嵌入上下文共享数据。


这个可能有点难理解，且听我慢慢道来 ～


## 三方 Cookie 对智能广告的影响

老读者都知道，在之前的文章中，我多次介绍过三方 `Cookie` 禁用后的影响以及一些解决方案，比如下面几篇文章：


- [当浏览器全面禁用三方 Cookie](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490361&idx=1&sn=ebc8dcc4d095cc7ba748827dff158f2b&source=41#wechat_redirect)
- [详解 Cookie 新增的 SameParty 属性](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490863&idx=1&sn=a9cfa840c4c2c664aab28b6c70245dc9&chksm=c2e2e804f5956112bc39d08c696ba232949d58cf447387bcbfc330a3d4cd6eb84d2e082e4dea&token=406950475&lang=zh_CN#rd)
- [详解 Cookie 的分区存储（CHIPS）](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493309&idx=1&sn=b037c33a1b9d434cc502ab380d453433&chksm=c2e11396f5969a805d63be30d50dfc8367da7484da252e343d74997a82bb187544eec76b3114&scene=178&cur_album_id=2160442714947911680#rd)
- [三方 Cookie 替代品 — 隐私沙盒的最新进展](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490934&idx=1&sn=4c5c086d3b736c6397212740005ee040&chksm=c2e2e85df595614b90ae2c04198e19377fdf386b8569bdfbb70127cfec2d5be8c9726040ef98&scene=178&cur_album_id=2160442714947911680#rd)

因为三方 `Cookie` 禁用的影响太大了，很多的业务场景都会受到影响，今天我们来看看广告业务：

在浏览网页的时候，你可能在一个站点上查看过某些产品，然后你可能又会在其他网页中看到它的广告，这就是广告智能推荐。

这种技术主要还是通过使用第三方 `Cookie` 跨站点共享信息的跟踪技术来实现的。

当三方 `Cookie` 完全禁用，这种技术会受到很大影响。 


## 浏览器的存储分区

为此，浏览器正在研究 `存储分区`，它会将每个站点的浏览器存储分开。这意味着嵌入在具有相同 `eTLD+1` 的网站（例如 `frame.example` 和 `conardli.example`）上的 `iframe` 可以共享浏览器存储。嵌入在具有不同主机名（例如 `frame.example` 和 `site.other`）的网站上的 `iframe` 不会共享浏览器存储。

`存储分区` 会影响浏览器的所有标准存储 `API`，包括 `LocalStorage、IndexedDB` 和 `Cookie`。在存储分区世界的中，跨第一方存储的信息泄漏将大大减少。


## Fenced frames 提案

现在，我们的业务大多可能会使用 `iframe` 去嵌入一些智能推荐的广告。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e3a3bb3e18ab42ad905ee08ef7375052~tplv-k3u1fbpfcp-zoom-1.image)

但是我们的顶级站点可以读取到  `iframe` 的 `src` 属性，这就以为着顶级站点可以从广告的 `URL` 推断有关访问者兴趣的信息，这在一定程度上就泄露了用户隐私。

`Fenced frames` 是一项隐私沙盒提案（`https://github.com/WICG/fenced-frame`），它建议顶级站点应该对数据进行分区。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31c15b5d90f24b188bf889ea95339947~tplv-k3u1fbpfcp-zoom-1.image)


使用 `Fenced frames` ，我们依然可以显示与访问者兴趣相匹配的广告，但顶级站点是无法从 `frame` 的 `src` 属性中推断出用户的兴趣信息的，这个信息只有广告商知道。

## Fenced frames 和 iframe 对比


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/488c01fb47ed4b8897206f2e75f80ea8~tplv-k3u1fbpfcp-zoom-1.image)

从对比上来看，`iframe` 还是要更灵活的，`Fenced frames` 是无法取代 `iframe` 的，但是当我们需要在同一页面上显示来自不同顶级分区的数据时，建议使用 `Fenced frames` 作为更私有的嵌入框架。

如果嵌入的网页是受信任的，还是用 `iframe` 即可。


## 使用 Fenced frames

常规的用法和 `iframe` 一样，我们可以用 `src` 属性来引入一个嵌入的内容：

```html
<fencedframe src="conardli.html"></fencedframe>
```


另外 `Fenced frames` 可能会和其他的 [隐私沙盒](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490934&idx=1&sn=4c5c086d3b736c6397212740005ee040&chksm=c2e2e85df595614b90ae2c04198e19377fdf386b8569bdfbb70127cfec2d5be8c9726040ef98&scene=178&cur_album_id=2160442714947911680#rd) 的 API 来配合使用，浏览器可能会为 `Fenced frames` 生成一个不透明的 `URL` 。

例如，配合 `FLEDGE`，浏览器可以生成一个 `urn:uuid`，来映射智能广告推荐的 `URL`：


```html
<fencedframe src="urn:uuid:c36973b5-e5d9-de59-e4c4-364f137b3c7a" mode="opaque-ads" ></fencedframe>
```

只有在 `Fenced frames` 内部嵌入的广告商的站点才能获取到  `urn:uuid`  和 `URL` 的真实映射关系，外部的顶级站点是获取不到的。

注意， `Fenced frames`  不能使用 `postMessage` 与它的父元素进行通信。但是，一个 `Fenced frames` 可以使用 `postMessage` 和它的 `iframes`进行通信。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f164a7332a94bd4afc9ada67df1524e~tplv-k3u1fbpfcp-zoom-1.image)

浏览器会给从 `Fenced frames` 和嵌入在 `Fenced frames` 中的 `iframes` 发出的请求设置 `Header`：

```js
Sec-Fetch-Dest: fencedframe
```

对应的，为了正常响应 `Fenced frames` 嵌入的文档，服务端也需要设置下面的 `Header`：

```js
Supports-Loading-Mode: fenced-frame
```

有了 `Fenced frames` ，我们就可以在不和嵌入的广告商共享用户信息的情况下实现智能广告推荐了，相信它未来将是禁用三方 `Cookie` 后智能广告推荐领域的主要解决方案。

## 兼容性 

`Chrome` 从 `97` 版本后开始支持，其他浏览器尚未支持，如果需要在 `Chrome` 中试用，可以开启下面的 `flag`：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92b59ab2a37d4a189f4f8f077a993d38~tplv-k3u1fbpfcp-zoom-1.image)



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
