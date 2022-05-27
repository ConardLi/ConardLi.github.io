---
title: Chrome 100：有风险也有机遇！
category: Web
tag: 
- 浏览器策略
- 最新提案
date: 2022-04-06	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


最近 `Chrome` 刚刚发布了 `100` 版本，我们来看看有哪些我们需要注意的点？

## 三位数的版本号


记得 `Chrome` 在很久以前第一次达到版本号 `10` 时，随着主要版本号从一位数变为两位数，很多  `User-Agent` 解析库发生了很多问题。现在 `Chrome` 和 `Firefox` 都马上要突破 `100` 版本了，`Edge` 也不甘落后，我们可能需要提前注意一下三位数版本号可能会带来的相关问题，以便在它真的升上去的时候做好准备。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10b6c194d4e5435dbb775785eef885ae~tplv-k3u1fbpfcp-zoom-1.image)


这里举几个可能出问题的场景：

从 `userAgent` 取到的浏览器版本号为字符串，你直接用字符串去比较版本大小：

```js
var browser_version = "100";
var support_min_version = "90";
if (browser_version < support_min_version) {
  console.log("too old");
} else {
  console.log("supported");
}
```

这个在 `版本<100` 的时候是没啥问题的，但是一旦突破 `100`，比较可能就乱了：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/37922a659b38419aab8015092a9dc520~tplv-k3u1fbpfcp-zoom-1.image)

比较好的做法是先将字符串转成整数：

```js
var browser_version = parseInt("100", 10) 
var support_min_version = 90; 
if (browser_version < support_min_version) {
  console.log("too old");
} else {
  console.log("supported");
}
```

另外还有个比较常见的问题，代码里如果用正则匹配 `UA` 中的浏览器版本，可能写死了两位数：

```js
const ua_string = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0";
const ua_100 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0";
ua_string.match(/Firefox\/(\d\d)/); //  ["Firefox/91", "91"]
ua_string.match(/Firefox\/(\d{2})/); // ["Firefox/91", "91"]
ua_string.match(/Firefox\/(\d\d)\./); //  ["Firefox/91.", "91"]
ua_100.match(/Firefox\/(\d\d)/); //  ["Firefox/10", "10"]
ua_100.match(/Firefox\/(\d{2})/); // ["Firefox/10", "10"]
ua_100.match(/Firefox\/(\d\d)\./); //  null
```

更好的做法是不应该限制数字位数：

```js
ua_string.match(/Firefox\/(\d+)/); //  ["Firefox/91", "91"]
ua_string.match(/Firefox\/(\d+)/); //  ["Firefox/100", "100"]
```


我在去年就分析过这个问题了，现在还没注意到的，要认真看看这个了 👉 [Chrome 版本即将突破100 ？这个问题不容忽视！](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490936&idx=1&sn=9701cf4d62997b39954bc3374b2ceb56&chksm=c2e2e853f595614549d34fd91c9122f3114ce1e2ffd31201af648416b5e62130a1138eecc3cc&scene=178&cur_album_id=2160442714947911680#rd)



## 100CoolWebMoments

`1989` 年 3 月 12 日，在瑞士的欧洲核子研究中心工作的蒂姆·伯纳斯-李向他的老板递交了一篇题目为“`Information Management: A Proposal`”的建议书。后来人们把这一天当作万维网 (`WWW, World Wide Web`) 诞生的日子。一晃三十年过去，`web` 早已成为这个世界重要的组成部分。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10539d1bd7f1454693e4cb2077ce8994~tplv-k3u1fbpfcp-zoom-1.image)

在 `Chrome 100` 版本发布的日子，`Google` 发布了 `Web 100` 个令人激动的瞬间 (`https://developer.chrome.com/100/`)，同时也在推特上发起了 `#100CoolWebMoments` 活动。

这个我也总结过了，感兴趣 👉 [100个Web令人激动的时刻](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493584&idx=1&sn=746b05b6dbf757fd25818356d3243382&chksm=c2e112fbf5969bed9f68549a26977794106e38cef808157bc60b30ae23744073dc1abbdd1f9c#rd)



## 简化的 User-Agent

`Chrome 100` 将是最后一个默认支持未删减的 `User-Agent` 字符串的版本。Chrome 推荐大家用新的 `User-Agent Client Hints API` 替换 `User-Agent` 字符串。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fe1e4c9c50d54d6196593bd16f3d7cfa~tplv-k3u1fbpfcp-zoom-1.image)


从 `Chrome 101` 开始， `User-Agent` 将逐渐减少。

这个问题我之前也讲过了，👉 [Chrome：听说你们滥用 UA? 废了它！](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247492922&idx=1&sn=20520b7f6eb023925dc04a4f026ff937&chksm=c2e11011f59699077fd1af23efb47f711736a6d73ce580a27209fac1f1b2ce0c0ea248da3982&token=2113675228&lang=zh_CN#rd)


## 多屏窗口放置API



对于某些应用程序，打开新的窗口并将它们放在特定位置或特定显示器是一项很重要的功能。比如，我们在演示 `PPT` 的时候，我希望 `PPT` 在主显示器上全屏显示，而我们做的一些讲稿的备注信息希望显示在另一个显示器上。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e10d084775f4d0786b13cc38956d65f~tplv-k3u1fbpfcp-zoom-1.image)


`Chrome 100` 为我们带来了新的 `Multi-Screen Window Placement API`，它可以把连接到用户机器的显示器枚举出来，并将窗口放置在特定屏幕上。

您可以通过 `window.screen.isExtended` 快速检查是否有多个屏幕连接到设备：

```js
const isExtended = window.screen.isExtended;
// returns true/false
```

关键功能在 `window.getScreenDetails()` 中，它提供了有关附加显示器的详细信息。

```js
const x = await window.getScreenDetails();
// returns
// {
//    currentScreen: {...}
//    oncurrentscreenchange: null
//    onscreenschange: null
//    screens: [{...}, {...}]
// }
```


比如，你可以确定哪个是主屏幕，然后用 `requestFullscreen()` 让某些元素在该显示器上全屏显示。

```js
try {
  const screens = await window.getScreenDetails();
  const primary = screens
         .filter((screen) => screen.primary)[0]
  await elem.requestFullscreen({ screen: primary });
} catch (err) {
  console.error(err);
}
```

它还提供了一个事件监听器，可以监听到插入或移除新显示器、分辨率变化等事件。

```js
const screens = await window.getScreenDetails();
let numScreens = screens.screens.length;
screens.addEventListener('screenschange', (event) => {
  if (screens.screens.length !== numScreens) {
    console.log('Screen count changed');
    numScreens = screens.screens.length;
  }
});
```

另外，W3C 第二屏工作组（`Second Screen Working Group` 旨在开发有关规范以支持网页使用辅助屏幕来显示网页内容）近期也更新了工作章程：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff3f05199de64252a7844132a7dea10d~tplv-k3u1fbpfcp-zoom-1.image)

新章程将多屏窗口放置 API 纳入标准化流程，该规范允许 `Web` 应用查询其设备获取直接连接的显示器信息，并在特定屏幕上放置内容。

## 参考

- https://www.youtube.com/watch?v=VK7oR5vLluk&t=65s
- https://developer.chrome.com/blog/new-in-chrome-100/
- https://web.dev/multi-screen-window-placement/


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
