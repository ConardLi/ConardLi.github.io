---
title: CORS 预检 — 私有网络访问
category: Web
tag: 
- Web安全
- 浏览器策略
- 最新提案
- CORS
date: 2022-01-10	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


在刚刚发布的 `Chrome 98` 里面，有这样一项更新：

> `Chrome` 将在任何对子资源的私有网络请求之前开始发送 `CORS` 预检请求，该请求需要目标服务器的明确许可。

啥？`CORS` 不是用来解决跨域的吗，跟私有网络有啥关系？啥是私有网络请求？

能问出这俩问题，一定没好好看我的公众号，其实之前在多篇文章里都提到过相关的策略解读，

- [跨域，不止CORS](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490585&idx=1&sn=50f95cbe025007a0a8d47b4a5afe9b98&chksm=c2e2e932f5956024a2613ea9d21281539ea9a39b22ce2765e92c4c4cb359575bbc1cf3a3c6be&token=505539647&lang=zh_CN#rd)
- [Chrome 安全策略 - 私有网络控制（CORS-RFC1918）](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490699&idx=1&sn=ddd363e820f4037c7c17142dbe538fde&chksm=c2e2e9a0f59560b62dfc5aef251546d92b48f688975c08952cbc71f717b48053b9b32098df94&token=505539647&lang=zh_CN#rd)
- [Chrome 重大更新，将限制 localhost 访问？](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490866&idx=1&sn=375807f87963042b69394b42df09e62e&chksm=c2e2e819f595610f2e02dbdd336b2b6e879211f085e19f5d71214f575c22c0e98bcaefbf26e1&token=505539647&lang=zh_CN#rd)

在  `Chrome 98` 这个版本，对私有网络的限制正式生效啦，主要目的是保护用户免受针对私有网络上的路由器和其他设备的 `CSRF` 攻击。攻击者可以借助这个攻击方式将他们重定向到恶意服务器。


## 私有网络

私有网络请求指的是目标服务器的 `IP` 地址比请求发起者获取的 `IP` 地址更私密的请求。例如，从公共网站 (`https://example.com`) 到私人网站 (`http://router.local`) 的请求，或从私人网站到 `localhost` 的请求。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3afcf1a56a694958b312bc051defe76b~tplv-k3u1fbpfcp-zoom-1.image)

专用网络访问（以前称为`CORS-RFC1918`）会限制网站向私有网络上的服务器发送请求的能力。


`Chrome` 已经实现了部分规范：从 `Chrome 96` 开始，只允许安全上下文发出私有网络请求。


## 预检请求

预检请求是跨域资源共享(`CORS`)标准引入的一种机制，用于在向目标网站发送可能有副作用的 `HTTP` 请求之前先向其请求一个许可。这确保了目标服务器理解 `CORS` 协议并显着降低了 `CSRF` 攻击的风险。

权限请求会作为 `OPTIONS HTTP` 请求发送，带有描述即将到来的 `HTTP` 请求的特定 `CORS` 请求标头（比如：`Access-Control-Request-Method`）。响应也必须携带明确同意即将到来的请求的特定 `CORS` 响应标头（比如：`Access-Control-Allow-Origin`）。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f78b98e4e6cb4cee86d734562ede624b~tplv-k3u1fbpfcp-zoom-1.image)

## CORS 预检新增的两个 Header

为了限制私有网络请求，新增了两个 `CORS` 预检 `Header`


- `Access-Control-Request-Private-Network: true` 在所有私有网络预检请求上设置
- `Access-Control-Allow-Private-Network: true` 必须在所有私有网络预检响应上设置

> 注意：无论请求方法和模式如何，都会为所有私有网络请求发送预检请求。这个请求在 `cors` 模式以及 `no-cors` 所有其他模式中的请求之前就已经发送了。


如果目标 `IP` 地址比发起请求的网址更私密，私有网络的预检请求也会针对同源请求发送。这和我们理解的常规 `CORS` 不一样，其中预检请求只会用于跨域请求。同源请求的预检请求还可防止 `DNS` 重新绑定攻击。

## 一个例子

### 在 NO-CORS 模式下

假设我们在 `https://foo.example/index.html` 嵌入了 `<img src="https://conardli.example/cat.gif" alt="dancing cat"/>` 并且， `conardli.example` 会解析为 私有 IP 地址 `192.168.1.1` 。

Chrome 首先会发送一个预检请求：

```
HTTP/1.1 OPTIONS /cat.gif
Origin: https://foo.example
Access-Control-Request-Private-Network: true
```

想要让这个请求成功，服务器必须响应：

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Private-Network: true
```

> 如果你设置了 `Access-Control-Allow-Origin: *`，也是可以请求成功的，不过这个风险较大，不建议设置。

### 在 CORS 模式下

假如我们在 `https://foo.example/index.html` 运行了下面的代码：

```js
await fetch('https://conardli.example/delete-everything', {
  method: 'PUT',
  credentials: 'include',
})
```

`conardli.example` 假如被解析为 `192.168.1.1`

`Chrome` 首先发送一个预检请求：
```
HTTP/1.1 OPTIONS /delete-everything
Origin: https://foo.example
Access-Control-Request-Method: PUT
Access-Control-Request-Credentials: true
Access-Control-Request-Private-Network: true
```
想要让这个请求成功，服务器必须响应：
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Methods: PUT
Access-Control-Allow-Credentials: true
Access-Control-Allow-Private-Network: true
```

然后 Chrome 将发送实际请求：

```
HTTP/1.1 PUT /delete-everything
Origin: https://foo.example
```

服务器可以按照正常的 `CORS` 规则对它进行响应：

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://foo.example
```

## 怎么知道我的网站会不会受影响

从 `Chrome 98` 开始，如上面我们介绍的预检请求失败，请求依然会成功，但会在 `DevTools` 问题面板中显示一个警告。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06f41357f89e443a9a6f12723646ca91~tplv-k3u1fbpfcp-zoom-1.image)

受影响的预检请求也可以在 `Network` 面板中查看得到：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb6b6aec1db64630b4fb215fcfe5d4f3~tplv-k3u1fbpfcp-zoom-1.image)


如果你想查看一下强制执行预检成功会发生什么，你可以改一下下面的命令行参数（从 `Chrome 98` 开始）：
```
--enable-features=PrivateNetworkAccessRespectPreflightResults
```

## 具体的实施计划

在 `Chrome 98` 中：
- `Chrome` 在私有网络子资源请求之前发送预检请求。
- 预检失败仅在 `DevTools` 中显示警告，不会影响私有网络请求。
- `Chrome` 会收集兼容性数据并联系受影响最大的网站。
- 希望在这期间现有网站能得到广泛兼容。

最早在 `Chrome 101` 中：
- 只有兼容性数据表明这个更改不会产生太大的影响并且我们在必要时才会开始。
- Chrome 强制要求预检请求必须成功，否则请求失败。
- 弃用试验同时开始，以允许受此阶段影响的网站请求延长时间，试验将持续至少 6 个月。

想了解更多细节，请查看 Chrome 官方博客：`https://developer.chrome.com/blog/private-network-access-preflight/`


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
