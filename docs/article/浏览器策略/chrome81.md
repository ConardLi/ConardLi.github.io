---
title: Chrome 81 正式发布 ！消灭混合内容最后一步~
date: 2019-12-28 11:11:00
---


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200409002148.png)

`Chrome 81` 于前天正式发布了，这个版本其实最初是计划在 `3 月 17 号` 发布的，但由于冠状病毒（`COVID-19`）爆发而导致推迟到了现在。`Chrome 81` 的延迟也扰乱了 `Google` 正常的六周发布时间表。因此 `Google` 此前也宣布，下一个版本将直接跳过 `Chrome 82` ，直接发布 `Chrome 83`。

下面我就来带大家看看 `Chrome 81` 有哪些重要的更新。

## 速览

- 混合内容升级三步走的第三步 —— 禁用混合img资源
- 删除 FTP 协议支持
- 弃用 TLS 1.0 和 TLS 1.1（延迟）
- TLS 1.3 稳定性增强
- 不安全的下载将被直接阻止
- 支持 WEB NFC

## 混合内容升级三步走的第三步 —— 禁用混合img资源

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200408234938.png)

`Chrome 81` 标志着 `Google` 分三步走的计划中的最后一个版本，该计划目的是从网络上全面消除混合 `HTTPS` 内容。

> 混合 `HTTPS` 内容早在上个版本（`Chrome 80`）的更新中我就介绍过了：是指通过 `HTTP` 和 `HTTPS` 加载图像、`JavaScript` 或样式表等内容的网页，这意味着该站点实际上并不完全通过 `HTTPS` 加载。

`Google` 宣布的最终目标是将所有 `HTTP` 内容自动升级到他们的模拟 `HTTPS URL`。但是，一次性执行这样的操作是很危险的，因为这可能会导致大量混合内容的站点出现问题。

因此，为了防止造成重大破坏，`Google` 为该过程选择了一个三步计划：

在 `2019` 年 12 月发布的 `Chrome 79` 中，该团队将引入一个新设置来取消阻止特定网站上的混合内容。此设置将应用于混合脚本、`iframe` 和 `Chrome` 当前默认阻止的其他类型的内容。用户可以通过单击任意 `https://` 页面上的锁定图标并单击“站点设置”来切换此设置。这将替换显示在多功能框右侧的屏蔽图标，以取消阻止以前版本的台式机 `Chrome` 浏览器中的混合内容。

在 `Chrome 80` 中，混合的音频和视频资源将自动升级到 `https://`，如果它们无法通过 `https://` 加载，则 `Chrome` 默认会阻止它们。 `Chrome 80` 仍然可以加载混合图像资源，但它们会使 `Chrome` 在状态框上显示不安全。

在 `Chrome 81` 中，混合的图像资源会自动升级到 `https://`，如果无法通过 `https://` 加载，`Chrome`默认会阻止它们。

## 弃用 TLS 1.0 和 TLS 1.1（延迟）

`Chrome` 小组早在去年10月就宣布了淘汰旧版TLS版本（`TLS 1.0和1.1`）的计划。`Firefox 74` 也在前几天宣布将禁用基于 `TLS 1.0 和 TSL 1.1` 协议的网站。

在 `Chrome 81` 中，`Chrome` 将用整页警告标记用户不支持 `TLS 1.2` 更高版本的站点连接不完全安全。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200408233242.png)

但是，在最新的 `Chrome` 官方博客中我发现：从 `Chrome` 删除 `TLS 1.0` 和 `TLS 1.1` 加密协议的计划现在延迟到了 `Chrome84`。延迟删除这两个协议的决定与当前的新冠病毒爆发有关，因为很多重要政府医疗网站还在使用 `TLS 1.0 和 1.1` 来建立其 `HTTPS` 连接，现在进行整页警告可能会对抗击疫情造成影响。

目前 `Chrome` 将继续针对使用 `TLS 1.0` 或 `1.1` 的网站显示 “不安全” 提示， `Chrome 81 Beta` 会显示受影响网站的整页插页式警告。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200408233224.png)

## 删除 FTP 协议支持

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200408235120.png)

`Chrome 81` 将不再直接支持 `FTP` 协议，建议用户使用本机 FTP 客户端。

## TLS 1.3 稳定性增强

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200409000412.png)

在 `Chrome` 之前的更新中，由于开启了 `TLS 1.3`，但是兼容性没有处理好，而 `TLS 1.3` 只有在浏览器端和服务器同时支持的时候才能正常访问。从而导致大量用户无法访问站点，谷歌官方当时给出的解决办法是先关闭浏览器的 `TLS 1.3` 版本的支持。后来 `Chrome` 又禁用了一些 `TLS 1.3` 的功能才使得访问稳定。

`Chrome 81` 中又对 `TLS 1.3` 做了加强，防止攻击者降级到 `TLS 1.2` 及更早版本，并且支持了 `TLS 1.3` 完整功能的向后兼容。

## 不安全的下载将被直接阻止

从 `Chrome 83` 开始，不安全的下载将直接被阻止，和上面的混合内容更新一样，这个更新也是分步进行的，直到 `Chrome 86` 所有在安全页面上的不安全的下载将被全部阻止：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200409001137.png)

## 支持 WEB NFC


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200409001922.png)

`Chrome` 中添加的新的 `Web NFC` 标准将允许网站与 `NFC` 标签进行交互，从而无需用户在手机上安装特殊的应用程序。

```js
const reader = new NDEFReader();

async function startScan() {
  await reader.scan();
  reader.onreading = (e) => {
    console.log(e.message);
  };
}
```

`Google` 相信，新的 `Web NFC` 标准将在 `Web` 开发人员中取得广泛的应用，尤其是对于 `Android` 版 `Chrome` 而言，该标准可用于以下场景：

当用户将运行 `Chrome` 的智能手机或平板电脑触摸展览附近的 `NFC` 卡时，博物馆和美术馆可以显示有关显示器的其他信息。

处理公司库存的网站，公司站点和 `Intranet` 将能够读取数据或将数据写入容器或产品上的 `NFC` 标签，从而简化库存管理。

会议现场可以使用它来扫描 `NFC` 标签。

## AR（增强现实）支持

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20200409002114.png)

谷歌为 `WebXR API` 增加了两个沉浸性特性，允许在相机视图中放置虚拟物体。