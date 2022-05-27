---
title: 使用 Rust 编写更快的 React 组件
category: WebAssembly
tag: 
- Rust
- WebAssembly
date: 2021-11-28
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



上周发了一篇 `Wasm` 的文章，主要分析的是今年 `Google` 开发者大会上的 `Wasm` 主题：

[Wasm 为 Web 开发带来无限可能](https://mp.weixin.qq.com/s/dRN6Ak3FwkAKrTmKm0f6NA)

其实主要还是我个人对 `Rust` 比较感兴趣，在今天的文章中，我将带大家完成一个将 `Rust` 实际应用到 `React` 项目中的小 `Demo`。


## Wasm

在开始之前，我们还是先来回顾下 `Wasm`:


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b90e69dc655e4f8da7a70e0257bdf706~tplv-k3u1fbpfcp-zoom-1.image)


`WebAssembly` 是一种二进制指令格式，简称为 `Wsam`，它可以运行在适用于堆栈的虚拟机上。

`WebAssembly` 存在的意义就是成为编程语言的可移植编译目标，让在 `Web` 上部署客户端和服务端应用成为可能。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/58b0c0f4530a48a0ae21416c2635c0e5~tplv-k3u1fbpfcp-zoom-1.image)

 `Wsam` 具有紧凑的二进制格式，可为我们提供近乎原生的网络性能。随着它变得越来越流行，许多语言都编写了编译成 Web 程序集的绑定工具。

## 为什么是 Rust

`Rust` 是一个快速、可靠二期又节约内存的编程语言。在过去六年的 `stackoverflow` 的最受喜爱的编程语言中，它一直蝉联榜首的位置，主要还是这个语言本身拥有众多的优点，比如：


- 内存安全
- 类型安全
- 消除数据竞争
- 使用前编译
- 建立（并且鼓励）在零抽象之上
- 最小的运行时（无停止世界的垃圾搜集器，无 `JIT` 编译器，无 `VM`）
- 低内存占用（程序可以运行在资源受限的环境，比如小的微控制器）
- 针对裸机（比如，写一个 `OS` 内核或者设备驱动，把 Rust 当一个 ‘高层’汇编器使用）”

另外，`Rust` 在 `WebAssembly` 领域的贡献非常大的，使用 `Rust` 编写 `WebAssembly` 非常简单。

但是，`Rust` 存在的目的不是为了替代 `JavaScript` 而是和他形成互补，因为 `Rust` 语言的学习曲线是非常陡峭的，用它去完全替代 `Web` 开发几乎是不可能的。

所以，我们一般会在 `Web` 开发的工具链，或者前端页面中一些非常大量的数据计算中的操作用到它。


## 前置知识

在开始开发之前，你需要了解一些前置知识，`React` 相关的就不多说了，我们来看看 `Rust` 相关的几个重要概念。

#### cargo


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fe4f9e12e7c54c89830866013e1e4979~tplv-k3u1fbpfcp-zoom-1.image)


`cargo` 是 `rust` 的代码组织和包管理工具，你可以将它类比为 `node.js` 中的 `npm`。

`cargo` 提供了一系列强大的功能，从项目的建立、构建到测试、运行直至部署，为 `rust` 项目的管理提供尽可能完整的手段。同时，它也与 `rust` 语言及其编译器 `rustc` 本身的各种特性紧密结合。


#### rustup

`rustup` 是 `Rust` 的安装和工具链管理工具，并且官网推荐使用 `rustup` 安装 `Rust`。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/600ca7a80dce41fba0d50b5007d6656e~tplv-k3u1fbpfcp-zoom-1.image)

`rustup` 将 `rustc`（rust编译器） 和 `cargo` 等工具安装在 `Cargo` 的 `bin` 目录，但这些工具只是 `Rust` 工具链中组件的代理，真正工作的是工具链中的组件。通过 `rustup` 的命令可以指定使用不同版本的工具链。




#### wasm-bindgen


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e41856118a684f7f8d4a93ee480213fb~tplv-k3u1fbpfcp-zoom-1.image)


`wasm-bindgen` 提供了 `JS` 和 `Rust` 类型之间的桥梁，它允许 `JS` 使用字符串调用 `Rust API`，或者使用 `Rust` 函数来捕获 `JS` 异常。

`wasm-bindgen` 的核心是促进 `javascript` 和 `Rust` 之间使用 `wasm` 进行通信。它允许开发者直接使用 `Rust` 的结构体、`javascript`的类、字符串等类型，而不仅仅是 `wasm` 支持的整数或浮点数类型。


#### wasm-pack

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/76f11fe663e5445f97485c2f934ddcb5~tplv-k3u1fbpfcp-zoom-1.image)


`wasm-pack` 由 `Rust / Wasm` 工作组开发维护，是现在最为活跃的 `WebAssembly` 应用开发工具。

`wasm-pack` 支持将代码打包成 `npm` 模块，并且附带 `Webpack` 插件（`wasm-pack-plugin`），借助它，我们可以轻松的将 `Rust` 与已有的 `JavaScript` 应用结合。

#### wasm32-unknown-unknown


通过 `rustup` 的 `target` 命令可以指定编译的目标平台，也就是编译后的程序在哪种操作系统上运行。

`wasm-pack` 使用 `wasm32-unknown-unknown` 目标编译代码。

好了，了解了 `Rust` 相关的一些知识，我们一起来完成这个 `Demo` 吧。

## 一起来做个 Demo

在开始之前，要确保你的电脑上已经安装了 `Node` 和 `Rust`，可以在命令行分别输入 `npm`、`rustup` 看看能否找到命令，如果没安装的话自己先安装一下。

### 初始化一个简单 React 程序

首先，我们来初始化一个 `React` 项目，命令行执行 `npm init`：



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20f4a73f6a03461890918005568de0f2~tplv-k3u1fbpfcp-zoom-1.image)

然后，我们安装一些开发项目必备的包：

```
$ npm i react react-dom
$ npm i -D webpack webpack-cli webpack-dev-server html-webpack-plugin 
$ npm i -D babel-core babel-loader @babel/preset-env @babel/preset-react
```

然后，我们在项目中创建一些常用的文件夹：`src`、`page`、`public`、`build`、和 `dist`。

我们在 `page` 文件夹中创建一个 `index.jsx`，编写一些测试代码：

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(<h1>code秘密花园 Hello, world!</h1>, document.getElementById('root'));

```

然后，我们为 `babel` 和 `webpack` 创建两个配置文件：

 `.babelrc`：

```json
{
    "presets": [
        "@babel/preset-env",
        "@babel/preset-react"
    ]
}
```

`webpack.config.js`：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');

module.exports = {
  entry: './page/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[hash].js',
  },
  devServer: {
    compress: true,
    port: 8080,
    hot: true,
    static: './dist',
    historyApiFallback: true,
    open: true,
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${__dirname }/public/index.html`,
      filename: 'index.html',
    }),
  ],
  mode: 'development',
  devtool: 'inline-source-map',
};

```

然后，在 `public` 下创建一个 `index.html`：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>code秘密花园</title>
</head>

<body>
    <div id="root"></div>
</body>

</html>
```

下面检查下你的 `package.json`，看看和我的是不是一样：

```json
{
  "name": "react-wasm",
  "version": "1.0.0",
  "description": "一个 Rust 编写 React 组件的 Demo",
  "main": "src/index.jsx",
  "scripts": {
    "dev": "webpack server"
  },
  "keywords": [],
  "author": "ConardLi",
  "license": "MIT",
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "devDependencies": {
    "@babel/core": "^7.16.0",
    "@babel/preset-env": "^7.16.4",
    "@babel/preset-react": "^7.16.0",
    "babel-loader": "^8.2.3",
    "html-webpack-plugin": "^5.5.0",
    "webpack": "^5.64.2",
    "webpack-cli": "^4.9.1",
    "webpack-dev-server": "^4.5.0"
  }
}

```

下面，执行 `npm install`，然后 `npm run dev`，你就可以跑起来一个非常简单的 React 应用：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/39cb9124da0246848e388baa293b59a5~tplv-k3u1fbpfcp-zoom-1.image)




### 引入 Rust

好了，下面我们来编写我们的 `Rust` 组件（别忘了回顾下上面提到的 `Rust` 前置知识），首先我们使用 `Rust` 的包管理工具 `cargo` 来初始化一个简单的 Rust 应用程序：

```
cargo init --lib .
```

执行完之后，会创建一个 `Cargo.toml` 和一个 `src/lib.rc` 文件。

然后，我们在  `Cargo.toml` 中引入 `wasm-bindgen` 这个包，另外我们还需要告诉编译器这个包是一个 `cdylib`：

```toml
[package]
name = "react-wasm"
version = "1.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```

现在，你可以先尝试执行下 `cargo build`：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bf386b8a328e4646815ab53909942bdf~tplv-k3u1fbpfcp-zoom-1.image)

> 第一次执行可能会比较慢，可以 `Google` 搜一下怎么将 `cargo` 配置为国内源。

好了，上面只是测试一下构建，它现在还派不上用场，我们下面还要执行一下编译目标，执行：

```
$ rustup target add wasm32-unknown-unknown
```

指定好 `wasm32-unknown-unknown` 这个编译目标，我们才能把它应用到我们的 `React` 程序中，下面我们给我们的 `src/lib.rs` 写两个简单的函数：

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn big_computation() {
    alert("这个是一个超级耗时的复杂计算逻辑");
}

#[wasm_bindgen]
pub fn welcome(name: &str) {
   alert(&format!("Hi 我是 {} ，我在 code秘密花园 ！", name));
}
```

为了确保我们的 `Rust` 应用程序正常工作，我们重新用 `wasm32-unknown-unknown` 编译一下：

```
$ cargo build --target wasm32-unknown-unknown
```

然后我们安装一下 `wasm-bindgen-cli` 这个命令行工具，以便我们能利用我们创建的 `WebAssembly` 代码：

```
$ cargo install -f wasm-bindgen-cli
```
安装后，我们可以使用 `Rust` 生成的 `WebAssembly` 给我们的 `React` 代码创建一个包：

```
$ wasm-bindgen target/wasm32-unknown-unknown/debug/react_wasm.wasm --out-dir build
```

执行完成后，编译好的 `JavaScript` 包和优化好的 `Wasm` 代码会保存到我们的 `build` 目录中，以供 `React` 程序使用。


### 在 React 程序中应用 Wasm


下面，我们尝试一下在我们的 `React` 程序中用上这些 `Wasm` 代码，我们现在 `package.json` 中添加一些常用的 `npm` 脚本：

```json
  "build:wasm": "cargo build --target wasm32-unknown-unknown",
  "build:bindgen": "wasm-bindgen target/wasm32-unknown-unknown/debug/rusty_react.wasm --out-dir build",
  "build": "npm run build:wasm && npm run build:bindgen && npx webpack",
```

然后我们执行 `npm run build` 就可以打包所有代码啦。

下面，我们还需要安装一下上面我们提到的 `wasm-pack` 的 `Webpack` 插件，它可以帮助我们把 `Wasm` 代码打包成 `NPM` 模块：

```
npm i -D @wasm-tool/wasm-pack-plugin
```

最后更新一下我们的 `webpack.config.js`，添加下面的配置：


```js
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

  ...

  plugins: [
    ...
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, ".")
    }),
  ],
  ...
  experiments: {
    asyncWebAssembly: true
  }
```
下面，执行一下这几个命令： `npm run build:wasm、npm run build:bindgen、npm run build`，应该都不会报错。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a7fb5b8cb54149f4baf5fb91f95cb662~tplv-k3u1fbpfcp-zoom-1.image)

最后，我们在我们的 `React` 组件中调用一下我们刚刚生成的 `Wasm` 模块：

```js
import React, { useState } from "react";
import ReactDOM from "react-dom";

const wasm = import("../build/rusty_react");

wasm.then(m => {
  const App = () => {
    const [name, setName] = useState("");
    const handleChange = (e) => {
      setName(e.target.value);
    }
    const handleClick = () => {
      m.welcome(name);
    }

    return (
      <>
        <div>
          <h1>Hi there</h1>
          <button onClick={m.big_computation}>Run Computation</button>
        </div>
        <div>
          <input type="text" onChange={handleChange} />
          <button onClick={handleClick}>Say hello!</button>
        </div>
      </>
    );
  };

  ReactDOM.render(<App />, document.getElementById("root"));
});
```
下面，你就可以在 `React` 组件中愉快的使用 `Rust` 了！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f28e4654fb9f465083201a1469b686ed~tplv-k3u1fbpfcp-zoom-1.image)




## 参考

- https://www.rust-lang.org/learn
- https://rustwasm.github.io/
- https://www.joshfinnie.com/blog/using-webassembly-created-in-rust-for-fast-react-components/


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
