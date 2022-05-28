---
title: HTTPS 证书被伪造了怎么办？
category: Web安全
tag: 
- Web安全
- 浏览器策略
date: 2020-06-15
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


`HTTPS` 协议的安全依赖于它的证书机制，如果攻击者申请到了一张和你的网站一摸一样的证书，那你网站的安全机制也就不复存在了。本文来聊一聊，如何预防 `HTTPS` 证书伪造。

## 证书劫持

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b45462e5448243b59d471714c009b69e~tplv-k3u1fbpfcp-zoom-1.image)

如果想部署 `HTTPS` 网站，首先向 `CA` 机构申请一张证书， `CA` 机构在审核申请者的身份后，会签发一张证书，证书中包含了申请者网站的主机名、主机公钥，同时 `CA` 机构会用自己的私钥对整个证书进行签名，并将签名添加到证书文件中，然后发送给证书申请者。证书是 TLS 协议中非常关键的一环，其主要作用：

-   向网站访问者确认服务器的真实身份，确保客户端（浏览器）是和真正的网站提供者在通信，避免遇到中间人攻击，实现密码学中的身份认证特性。
-   客户端和服务器使用证书中的公钥（依赖于不同的密码协商算法，功能有所不同）协商出主密钥（`Master Secret`），有了主密钥，客户端和服务器端就可以保证通信数据是加密且没有被篡改。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a45c872c8504a89bd3a47b2d427087a~tplv-k3u1fbpfcp-zoom-1.image)

`HTTPS` 证书最大的问题就是伪造证书的存在，一旦出现伪造证书，安全体系将会非常脆弱，出现伪造证书的原因如下：

-   `CA` 机构有意无意会签发一些错误的证书，比如 `CA` 机构没有正确校验申请者的身份。
-   `CA` 机构是一个追求盈利的机构，在利益的驱动下，可能会无节制的签发证书，如果签发一个恶意的二级 `CA` 证书，带来的危害更大。
-   攻击者会通过各种技术攻击手段，冒充或者伪造某个域名的拥有者，从而成功申请到一张证书，然后通过证书进行危害操作。

这时，证书的使用者可能会存在下面的困惑：

-   域名拥有者无法知晓那些 `CA` 机构给他签发了证书，也不知道是否有人冒充他的身份申请证书并提供服务。
-   `CA` 机构并不清楚它到底签发了多少证书，也不确定是否签发了伪造证书，二级 `CA` 签发机制不可控。
-   对于浏览器来说，它没有技术手段校验证书是否是合法的。

## 证书透明度

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c86a9a5d61f0498f8c695b4d73d56348~tplv-k3u1fbpfcp-zoom-1.image)

为了解决证书潜在的问题，谷歌提出了一个解决方案，这就是证书透明度（CT）。CT 是一组技术解决方案，它能够审计、监控证书的签发、使用，从而让更透明，它不是证书的替代解决方案，而是证书的有效补充。通过 CT，能够达成以下的几个目标：

-   `CA` 机构能够知晓其签发了那些证书，并快速检测到是否签发恶意证书了。
-   网站拥有者能够知晓域名对应证书签发的全过程，一旦发现有攻击者伪造了域名对应的证书，可以快速联系 `CA` 机构，吊销该证书。
-   浏览器厂商能够审计证书的使用情况，如果发现有恶意证书，可以快速关闭HTTPS连接，保障用户的安全。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89c836aaf5904d43bdc80be1f12b84e0~tplv-k3u1fbpfcp-zoom-1.image)

CT 日志服务所使用的技术和区块链技术非常类似，通过密码学手段（Merkle hash tree）保证了其数据只能增长，但修改、插入、删除都会被发现。由于审计单条数据的成本并不高，审计员可以是一个单独的服务，也可以是观察者的一项功能，甚至可以作为客户端的一部分。

## Expect-CT

为了确保浏览器能在访问到缺少 `CT` 监督的证书（例如 CA 意外发出的证书）时采取措施，`Google` 提案增加了一个新的 `Expect-CT HTTP Header`，该 `HTTP Header` 用来告诉浏览器期望证使用书透明度服务。`Expect-CT` `CT` 头部允许站点选择报告或强制执行证书透明度要求，这可以防止站点证书错误被忽视的情况。当站点启用 `Expect-CT CT Header` 时，浏览器会检查该站点使用的证书是否出现在公共CT日志中，这能有效的避免中间人攻击等 `HTTPS` 威胁，让站点更加安全。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b3eae659b76492d95e8637d6b7e3ac9~tplv-k3u1fbpfcp-zoom-1.image)

```
    Expect-CT: report-uri="<uri>", enforce,max-age=<age>
```

在部署的时候有两种策略可供选择，一种是仅报告，一种是强制执行。在仅报告策略中，浏览器在没有收到有效的CT信息情况下，会向`report-uri`设置的地址发送报告。对于该策略，你可以如下设置：

```
    Expect-CT: max-age=0, report-uri="https://{$subdomain}.report-uri.com/r/d/ct/reportOnly"
```

该策略下，如果浏览器未收到有效的CT信息，不会终止连接，只会向你指定的URI发送报告。而第二种策略可如下设置：

```
    Expect-CT: enforce, max-age=30, report-uri="https://{$subdomain}.report-uri.com/r/d/ct/enforce"
```

这也就是告诉浏览器强制执行 `CT` 策略并且缓存该状态 `30s` 。如果浏览器没有收到有效的 `CT` 信息，将会终止链接同时也会发送报告。在正确的配置好 `CT` 信息后，你可以将该时间设置的更长。


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
