---
title: Wasm 为 Web 开发带来无限可能
category: WebAssembly
tag: 
- WebAssembly
date: 2021-11-21
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



大家好，我是 `ConardLi`，不知道有没有小伙伴关注今年的 Google 开发者大会，今年的大会在 11.16 号开始。

> Google 开发者大会 (Google Developer Summit) 是 Google 面向开发者和科技爱好者展示最新产品和平台的年度盛会。2021 年，Google 开发者大会以 “Develop as One” 为主题，携手开发者与合作伙伴共创机遇，共谋发展！

今年在 Web 方面，有 `Devtools`、`PWA`、核心网页指标、`CMS`、隐私沙盒等等：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51cdef5865f64fe684330eb1fa344ac7~tplv-k3u1fbpfcp-zoom-1.image)

其中隐私沙盒的最新进展我在前几天的文章里已经介绍过，没看过的的小伙伴可以看这里：

[三方 Cookie 替代品 — 隐私沙盒的最新进展](https://mp.weixin.qq.com/s/6yQcmtq10Eox5ZLQX5Zlew)


今天，我们来看看另一个我比较感兴趣的议题：`WebAssembly`。

本次大会上的分享人是来自 `Google` 的 `WebAssembly` 开发技术推广工程师 `Ingvar Stepanyan`。

## 什么是 WebAssembly


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/017e1cc8adf6432ca6d0add60013d1cc~tplv-k3u1fbpfcp-zoom-1.image)

`WebAssembly` 是一种二进制指令格式，简称为 `Wsam`，它可以运行在适用于堆栈的虚拟机上。

`WebAssembly` 存在的意义就是成为编程语言的可移植编译目标，让在 Web 上部署客户端和服务端应用成为可能。

## WebAssembly 可以为我们带来什么

#### 可移植性

如果你的网站现在想用一个能力，但是这个能力还没有被任何的 `JavaScript` 库实现，但是在其他编程领域里已经有了解决方案。

这时，你就可以借助 `WebAssembly` 将所需要的库编译为可以在 `Web` 上运行的二进制格式，在某些情况下甚至你还可以编译整个应用。一旦编译到 `WebAssembly` ，代码就可以在任何装有网络浏览器的设备上运行了，例如 PC、手机、平板电脑等等。

#### 安全性

 `WebAssembly`  需要在沙盒中运行，在沙盒中，除了初始化时程序主动提供给它的内容，它无法访问其他主机的内存和函数。
 
这意味着， `WebAssembly` ，在你没有给它下发命令的情况下，永远不会损坏你的主机进程内存，也无法随意访问文件系统或与其他设备通信。这就让它与运行在虚拟机和容器中的应用有相同的优势

#### 高效

与 `JavaScript` 等人类可读的语言相比， `WebAssembly` 的字节码可以用更少的字节表示相同的指令，并且在  `WebAssembly`  模块依然处于下载期间就可以被编译。

因为编译器已经事先完成了优化工作，在 `WebAssembly` 中可以更轻松的获取到可预测的性能

## WebAssembly 的开源应用

#### Squoosh


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0414f2dfa0a94bffad5c046e57b7b8fe~tplv-k3u1fbpfcp-zoom-1.image)

`Squoosh` 是一个超强的图像压缩Web应用程序，可让你深入研究各种图像压缩器提供的高级选项，例如比较视觉差异和文件大小以及下载优化后的图片版本。

`https://squoosh.app/`

它借助 `WebAssembly` 纳入了非常多的图片编解码器，这些编解码器可能来源于 `C、C++、Rust` 等等，在浏览器的标签页旧可以直接执行它们，不需要服务端做任何额外的处理。这让 `Squoosh` 可以处理很多旧的图片格式（例如 `JPEG、PNG`），也可以处理很多新的图片格式（例如 `AVIF、JPEG-XL`）。


 
#### FFMpeg

`FFmpeg` 是视频处理最常用的开源软件，它功能强大，用途广泛，大量用于视频网站和商业软件（比如 `Youtube` 和 `iTunes`），也是许多音频和视频格式的标准编码/解码实现。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aa228e179e1145c296b5d6665a2374c0~tplv-k3u1fbpfcp-zoom-1.image)



借助  `WebAssembly` 的能力，它现在有了一个 Web 版本：`FFMPEG.WASM`，让你可以在浏览器里处理视频，你可以到下面这个网址上去体验一下：

`https://ffmpegwasm.netlify.app/`

#### MediaPipe


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4831634e81db4faba5024ff06a9ad79f~tplv-k3u1fbpfcp-zoom-1.image)

`MediaPipe` 是一款由 `Google` 开发并开源的数据流处理机器学习应用开发框架。它是一个基于图的数据处理管线，用于构建使用了多种形式的数据源，如视频、音频、传感器数据以及任何时间序列数据。

`https://google.github.io/mediapipe/`
 
它支持多个平台，融入了  `WebAssembly` 和 `WebGL` 的强大能力，可以通过 `JavaScript` 在 `Web` 上提供机器学习模型。


## WebAssembly 用法

如果你现在有一个想要移植到 `WebAssembly` 的库，该怎么用呢？

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f10ec795c7f4ece8b271e63ea4be3de~tplv-k3u1fbpfcp-zoom-1.image)


实际上， `WebAssembly` 的官网 `webassembly.org` 是一个很好的开始，上面对于各种语言的教程都是比较全的，在这些教程里你可以学到怎么去用相应的工具链，怎么向 `WebAssembly` 构建代码，以及如何利用到 Web 上，下面我们看几个最常用的工具链。

#### Emscripten


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13e559e04bb049c7bc190803b4c116a9~tplv-k3u1fbpfcp-zoom-1.image)

`Emscripten` 是一个开源的编译器，可以将 `C/C++` 的代码编译成高度优化的 `JavaScript` 并且高效运行在现代浏览器上面，它推出的时间甚至比 `WebAssembly` 还要早。

现在，它可以将相同的 `C/C++` 代码编译到 `WebAssembly` ，并提供各种各样的工具和绑定关系帮助你将生成的代码继承到 Web 中。

例如，`Emscripten` 提供 `SDL` 实现，可以用于在画布上绘制内容以及播放 Web 中的音频，来转换对 `WebGL` 的调用。

> SDL（简单直接媒体层）是一个跨平台的开源开发库，旨在提供对输入和图形硬件的低级访问，用 C 语言编写，视频播放软件、模拟器和许多流行游戏都使用它。

#### Embind

不同语言都拥有不同的类型和内存表示法，`JavaScript 和 C++` 也不例外，当你编译成  `WebAssembly` 也是一样的情况，所以仅仅通过编译是无法解决这个问题的。

想要使用这些库中的结果，还需要一些中间层来转换双向传递的值。

在 `Emscripten` 中实现这点最简单的方法，是使用一个叫 Embind 的功能，下面是一个示例：

```c++
// quick_example.cpp
#include <emscripten/bind.h>

using namespace emscripten;

float lerp(float a, float b, float t) {
    return (1 - t) * a + t * b;
}

EMSCRIPTEN_BINDINGS(my_module) {
    function("lerp", &lerp);
}
```

通过 `EMSCRIPTEN_BINDINGS` 块，就可以以 `JavaScript` 函数形式声明对外开放的 `API`，以及转换作为实参传递到 `C++` 函数的值或者从 `C++` 返回的值。这样一来，你就可以将现有任何的 `C++` 库封装到一个对 `JavaScript` 友好的 API 中。

最后你可以同时编译 API 封装容器和之前构建的依赖项，并传递一个 `--bind` 参数来启用  `Embind`。

```js
emcc --bind -o quick_example.js quick_example.cpp
```
如果将其编译为 ` ` 扩展项，它会生成一个 `ES6` 兼容模块，然后你就可以从 `JavaScript` 代码导入它，异步初始化这个模块。

```js
import initModule from './mylib.mjs';

const Module = await initModule();
Module.lerp(1,2,3);

```

然后你就可以使用之前从 `EMSCRIPTEN_BINDINGS` 块声明的所有 API。

#### wasm-bindgen

如果你熟悉 `Rust` ，就知道它在 `WebAssembly` 领域的贡献是非常大的。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ecc8f5c8adf648a9a7399870010df688~tplv-k3u1fbpfcp-zoom-1.image)

`Rust` 提供了 `wasm-bindgen` 这个工具来支持为任何 `Web API` 生成绑定关系，以及将你自己的 `Rust` 函数导出为 `JavaScript`。

感兴趣你可以看一下下面这个在线教程： `https://rustwasm.github.io/`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cbc3ef7ea5e04b15936783980283bf0b~tplv-k3u1fbpfcp-zoom-1.image)

教程中有将 `Rust` 函数导出为 `JavaScript` 的详细指引，以及一些示例，和 `Embind`  一样，它也负责在语言之间的双向类型转换，参考下面这段代码： 

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
```

当你在一个 `extern` 块上应用 `wasm_bindgen` 属性时，就可以导入指定的 `API`，当你在自己的类型和函数上应用 `wasm_bindgen` 属性时，系统会导出相应的类型和函数。

在每种情况下，工具链都负责在后台为库生成类型转换， 以及 `JavaScript` 封装容器，甚至是 `TypeScript` 定义，声明 API 后，就可以编译库生成一个 ES6 模块。

```js
const rust = import('./pkg');

rust
  .then(m => m.greet('World!'))
  .catch(console.error);

```

与 `Emscripten` 的示例类似，也需要异步将其初始化一次，然后就可以作为常规的 `JavaScript` 模块进行调用。

## 将 JS/TS 编译成 WebAssembly

那么，`JavaScript、TypeScript` 能不能编译成 `WebAssembly` 呢？

答案是否定的，因为 `JavaScript` 是高度动态的语言，而  `WebAssembly` 属于静态类型语言，不过我们可以借助 `AssemblyScript` 来帮助我们模拟实现这一点。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d02427ae3aa4688b65e9037f5617b97~tplv-k3u1fbpfcp-zoom-1.image)

`AssemblyScript` 是一个 `TypeScript` 到 `WebAssembly` 的编译器，你可以到 `https://www.assemblyscript.org/` 去了解它的详细用法。

## 未来

 `WebAssembly` 现在已经处于稳定阶段了，几年前就被所有主流浏览器所支持，但是它仍在不断发展，探索新的能力。
 
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b221d5e2f6024db7937d7d6e22b0830f~tplv-k3u1fbpfcp-zoom-1.image)


在这些探索中，有一些改进了与 `JavaScript` 和 `Web` 的集成，有一些缩减了代码体积、，还有一些进一步提升了性能，想了解更多，可以到下面的网址进行查看：

`https://webassembly.org/roadmap/`


> 现代浏览器的功能早已不局限在简单的页面呈现，这就是为什么 `WebAssembly` 会诞生的重要原因之一。为了将沉重的任务性能提升到一个新的水平，在 `JavaScript` 和机器代码之间搭建了一座桥梁，由此才有了 `WebAssembly` 。

让我们期待 `WebAssembly` 可以在 Web 上带给我们更多的可能性吧～


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
