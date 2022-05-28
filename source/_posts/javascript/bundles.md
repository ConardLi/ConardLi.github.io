---
title: 分析网页 JavaScript Bundles 的几种方法
category: JavaScript
tag: 
- JavaScript
- 构建
date: 2020-08-23
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


分析你网页中的 `JavaScript Bundles` 大小，并限制网页中的 `JavaScript` 数量，可以减少浏览器花费在解析、编译和执行 `JavaScript` 的时间。这可以加快浏览器可以开始响应用户交互行为的速度，从而改善 `First Input Delay`、`Largest Contentful Paint` 等几个重要的性能指标。

本文我们来一起看看分析网页中 `JavaScript Bundles` 的几种方法。

## 查看 JavaScript 文件

使用 `Chrome Devtools` 中的 `Network` 看板是查看页面上下载所有 `JavaScript` 最简单的方法。

按 `Ctrl+Shift+J` 或在`Mac`上 `Command+Options+J` 打开 `Devtools`：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e894835859746a2a1c9ce73ad47b1f3~tplv-k3u1fbpfcp-zoom-1.image)

然后打开 `Network` 看板，在看板处于打开状态下重新刷新页面，并点击 `JS` 筛选项筛选出所有 `JavaScript` 文件。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89f9b33558a74770879bf8d0d263e0ca~tplv-k3u1fbpfcp-zoom-1.image)

可以看到，这是一个很简单的网页，里面的代码执行逻辑也很简单，但是如果是一个把所有依赖和代码逻辑都打包在一起的JS文件就不会这么容易分析了，里面的逻辑会非常混乱，你会很难看出里面的代码逻辑。

下面是一个将许多第三方库和本身站点的js模块打包到一起的网站：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0a45e96945b440586f1f3226e2699c3~tplv-k3u1fbpfcp-zoom-1.image)

下面我们来看看分析这种代码的方法：

## Show Coverage

按 `Ctrl+Shift+P` 或在`Mac`上 `Command+Options+PP` 打开命令菜单，搜索 `Coverage` 然后选择 `Show Coverage` 命令：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa90114044174c73bddbd44c6a348648~tplv-k3u1fbpfcp-zoom-1.image)

然后重新加载网页，在下拉菜单中选择 `JavaScript`：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66f3a7b6524f4049a497dd81c9535e18~tplv-k3u1fbpfcp-zoom-1.image)

在表格中，我们可以很明确的看到每个文件有多少未使用的 `JavaScript`，你还可以单击任何 `URL` 进行逐行查看分析。

## Webpack

尽管上面的方法能让我们看到有多少未使用的 `JavaScript` 但是要分析组成 `Bundles` 的模块仍然不容易。

如果你已经在你的网站上打包JS了，那么你肯定使用了 `webpack、rollup` 等模块打包器，其中很多的工具都为我们提供了分析模块的非常好的方式。

让我们看一个例子，如果你在用 `Webpack`，那么你可以生成一个 `stats.json` 的文件，其中包含所有打包模块的统计信息。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c60c4aefcc7444dbbf9d20a71543a1fe~tplv-k3u1fbpfcp-zoom-1.image)

虽然直接看这个文件也能看出有哪些模块，但是社区的一些工具能够帮我们更好的对模块信息进行可视化分析：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bedfce63ee3c47feaf9cc8114b7dc7af~tplv-k3u1fbpfcp-zoom-1.image)

比如 `webpack-bundle-analyzer`，它通过分析 `Webpack` 打包后的产物，将其映射到 `stats.json` 的模块名称，然后就创建出了打包产物的交互式树形可视化。显示了每个模块的大小、Gzip解析大小以及彼此之间的关系。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10fe0218e25946adb293d0b7b5ea6d9d~tplv-k3u1fbpfcp-zoom-1.image)

## SourceMap

这些打包器提供的可视化工具很棒，但是它们都属于打包器特定的工具，对于任何网站，无论使用任何打包器，都可以用 `SourceMap` 将打包后的代码还原成原始代码。这非常有用，因为它可以使我们在构建过程中经过混淆和转换的代码仍然可以被还原。

在压缩或打包后的 `JavaScript` 文件中，通过注释指向 `SourceMap` 文件的位置。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/afa8456e7fa845fabbd53cf316a1ce5e~tplv-k3u1fbpfcp-zoom-1.image)

所有比较新的浏览器都支持源映射，使用 `Chrome`，你可以在 `Devtools` 中启用它：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/36648bf350aa4a689d5ef5ce3e763b0f~tplv-k3u1fbpfcp-zoom-1.image)

当 `Chrome` 检测到可用的 `SourceMap` 时，可以还原源代码：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/07689bd09d8d4987ad9323293b60a121~tplv-k3u1fbpfcp-zoom-1.image)

## source-map-expoler

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aa8214c64224465299d1595e0714d92f~tplv-k3u1fbpfcp-zoom-1.image)

`source-map-expoler` 可以通过 `SourceMap` 生成打包产物的树形可视化关系，通过查看这些模块关系，我们可以发现一些问题：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/74e256563c7b4099b0266a5c7f789f6d~tplv-k3u1fbpfcp-zoom-1.image)

比如上面的 `moment、lodash` 两个库，占整个文件的比重非常大，它们的大小远远超出它们的使用价值，我们可以将它们都转换成 `ES` 模块，则它们可以变的更小更优化。

## Lighthouse

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65d36cfa2cf64ffb9818f759857f40d2~tplv-k3u1fbpfcp-zoom-1.image)

使用 `Lighthouse`，同样可以通过 `SourceMap` 分析我们打包产物中未使用的 `JavaScript` 代码。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/062d1c7c92a6445b8151e669563bd000~tplv-k3u1fbpfcp-zoom-1.image)

另外还有一个正在探索中的功能，可以利用 `SourceMap` 分析打包产物中在新浏览器不需要的 `polifill` 代码。

以上就是几种分析 `JavaScript` 打包产物的工具和方法，赶快用起来去优化你的 `JavaScript` 打包产物吧！

> 了解更多：<https://www.youtube.com/watch?v=MxBCPc7bQvM>



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
