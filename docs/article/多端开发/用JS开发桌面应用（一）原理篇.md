---
title: 用JS开发桌面应用（一）原理篇
date: 2019-06-10 20:45:35
tags:
     - electron
     - 多端开发
---

## 导读

使用`Electron`开发客户端程序已经有一段时间了，整体感觉还是非常不错的，其中也遇到了一些坑点，本文旨在从【运行原理】到【实际应用】对`Electron`进行一次系统性的总结。【多图，长文预警～】

本文所有实例代码均在我的[github electron-react](https://github.com/ConardLi/electron-react)上，结合代码阅读文章效果更佳。另外`electron-react`还可作为使用`Electron + React  + Mobx + Webpack `技术栈的脚手架工程。

## 一、桌面应用程序

![](http://www.conardli.top/img/electron/el_1_app.jpg)

> 桌面应用程序，又称为 GUI 程序（Graphical User Interface），但是和 GUI 程序也有一些区别。桌面应用程序 将 GUI 程序从GUI 具体为“桌面”，使冷冰冰的像块木头一样的电脑概念更具有 人性化，更生动和富有活力。

我们电脑上使用的各种客户端程序都属于桌面应用程序，近年来`WEB`和移动端的兴起让桌面程序渐渐暗淡，但是在某些日常功能或者行业应用中桌面应用程序仍然是必不可少的。

传统的桌面应用开发方式，一般是下面两种：

### 1.1 原生开发

直接将语言编译成可执行文件，直接调用系统`API`，完成UI绘制等。这类开发技术，有着较高的运行效率，但一般来说，开发速度较慢，技术要求较高，例如：

- 使用`C++ / MFC`开发`Windows`应用
- 使用`Objective-C`开发`MAC`应用

### 1.2 托管平台

一开始就有本地开发和UI开发。一次编译后，得到中间文件，通过平台或虚机完成二次加载编译或解释运行。运行效率低于原生编译，但平台优化后，其效率也是比较可观的。就开发速度方面，比原生编译技术要快一些。例如：

- 使用`C# / .NET Framework`(只能开发`Windows应用`)
- `Java / Swing`

不过，上面两种对前端开发人员太不友好了，基本是前端人员不会设计的领域，但是在这个【大前端😅】的时代，前端开发者正在想方设法涉足各个领域，使用`WEB`技术开发客户端的方式横空出世。

### 1.3 WEB开发

使用`WEB`技术进行开发，利用浏览器引擎完成`UI`渲染，利用`Node.js`实现服务器端`JS`编程并可以调用系统`API`，可以把它想像成一个套了一个客户端外壳的`WEB`应用。

在界面上，`WEB`的强大生态为`UI`带来了无限可能，并且开发、维护成本相对较低，有`WEB`开发经验的前端开发者很容易上手进行开发。

本文就来着重介绍使用`WEB`技术开发客户端程序的技术之一【`electron`】

## 二、Electron

![](http://www.conardli.top/img/electron/el_2_electron.jpg)


`Electron`是由`Github`开发，用`HTML，CSS`和`JavaScript`来构建跨平台桌面应用程序的一个开源库。 `Electron`通过将`Chromium`和`Node.js`合并到同一个运行时环境中，并将其打包为`Mac，Windows`和`Linux`系统下的应用来实现这一目的。

https://electronjs.org/docs

https://juejin.im/post/5c67619351882562276c3162#heading-5

### 2.1 使用Electron开发的理由：

- 1.使用具有强大生态的`Web`技术进行开发，开发成本低，可扩展性强，更炫酷的`UI`
- 2.跨平台，一套代码可打包为`Windows、Linux、Mac`三套软件，且编译快速
- 3.可直接在现有`Web`应用上进行扩展，提供浏览器不具备的能力
- 4.你是一个前端👨‍💻～

当然，我们也要认清它的缺点：性能比原生桌面应用要低，最终打包后的安装包和其他文件都比较大。

### 2.2 开发体验

**兼容性**

虽然你还在用`WEB`技术进行开发，但是你不用再考虑兼容性问题了，你只需要关心你当前使用`Electron`的版本对应`Chrome`的版本，一般情况下它已经足够新来让你使用最新的`API`和语法了，你还可以手动升级`Chrome`版本。同样的，你也不用考虑不同浏览器带了的样式和代码兼容问题。

**Node环境**

这可能是很多前端开发者曾经梦想过的功能，在`WEB`界面中使用`Node.js`提供的强大`API`，这意味着你在`WEB`页面直接可以操作文件，调用系统`API`，甚至操作数据库。当然，除了完整的` Node API`，你还可以使用额外的几十万个`npm`模块。

**跨域**

你可以直接使用`Node`提供的`request`模块进行网络请求，这意味着你无需再被跨域所困扰。

**强大的扩展性**

借助`node-ffi`，为应用程序提供强大的扩展性（后面的章节会详细介绍）。

### 2.3 谁在用Electron

![](http://www.conardli.top/img/electron/el_6_apps.png)

现在市面上已经有非常多的应用在使用`electron`进行开发了，包括我们熟悉的`VS Code`客户端、`GitHub`客户端、`Atom`客户端等等。印象很深的，去年迅雷在发布迅雷X`10.1`时的文案：

> 从迅雷X 10.1版本开始，我们采用Electron软件框架完全重写了迅雷主界面。使用新框架的迅雷X可以完美支持2K、4K等高清显示屏，界面中的文字渲染也更加清晰锐利。从技术层面来说，新框架的界面绘制、事件处理等方面比老框架更加灵活高效，因此界面的流畅度也显著优于老框架的迅雷。至于具体提升有多大？您一试便知。

你可以打开`VS Code`，点击【帮助】【切换开发人员工具】来`VS Code`客户端的界面。

![](http://www.conardli.top/img/electron/el_5_vscode.png)


## 三、Electron运行原理

![](http://www.conardli.top/img/electron/el_3_composition.png)

`Electron` 结合了 `Chromium`、`Node.js` 和用于调用操作系统本地功能的`API`。

### 3.1 Chromium

`Chromium `是` Google `为发展` Chrome `浏览器而启动的开源项目，`Chromium `相当于` Chrome `的工程版或称实验版，新功能会率先在` Chromium `上实现，待验证后才会应用在`Chrome `上，故` Chrome `的功能会相对落后但较稳定。

`Chromium`为`Electron`提供强大的`UI`能力，可以在不考虑兼容性的情况下开发界面。

### 3.2 Node.js

`Node.js`是一个让` JavaScript `运行在服务端的开发平台，`Node `使用事件驱动，非阻塞`I/O `模型而得以轻量和高效。

单单靠`Chromium`是不能具备直接操作原生`GUI`能力的，`Electron`内集成了`Nodejs`，这让其在开发界面的同时也有了操作系统底层` API `的能力，`Nodejs` 中常用的 `Path、fs、Crypto` 等模块在 `Electron` 可以直接使用。

### 3.3 系统API

为了提供原生系统的`GUI`支持，`Electron`内置了原生应用程序接口，对调用一些系统功能，如调用系统通知、打开系统文件夹提供支持。

在开发模式上，`Electron`在调用系统`API`和绘制界面上是分离开发的，下面我们来看看`Electron`关于进程如何划分。

### 3.4 主进程

`Electron`区分了两种进程：主进程和渲染进程，两者各自负责自己的职能。

![](http://www.conardli.top/img/electron/el_7_process.png)


`Electron` 运行` package.json `的 `main` 脚本的进程被称为主进程。一个 `Electron` 应用总是有且只有一个主进程。

**职责:**

- 创建渲染进程（可多个）
- 控制了应用生命周期（启动、退出`APP`以及对`APP`做一些事件监听）
- 调用系统底层功能、调用原生资源

**可调用的API:**

- `Node.js API`
- `Electron`提供的主进程`API`（包括一些系统功能和`Electron`附加功能）

### 3.5 渲染进程

由于 `Electron` 使用了 `Chromium` 来展示 `web` 页面，所以 `Chromium` 的多进程架构也被使用到。 每个` Electron` 中的 `web`页面运行在它自己的渲染进程中。

> 主进程使用 BrowserWindow 实例创建页面。 每个 BrowserWindow 实例都在自己的渲染进程里运行页面。 当一个 BrowserWindow 实例被销毁后，相应的渲染进程也会被终止。

你可以把渲染进程想像成一个浏览器窗口，它能存在多个并且相互独立，不过和浏览器不同的是，它能调用`Node API`。

**职责:**

- 用`HTML`和`CSS`渲染界面
- 用`JavaScript`做一些界面交互

**可调用的API:**

- `DOM API`
- `Node.js API`
- `Electron`提供的渲染进程`API`

## 四、Electron基础

### 4.1 Electron API

在上面的章节我们提到，渲染进和主进程分别可调用的`Electron API`。所有`Electron`的`API`都被指派给一种进程类型。 许多`API`只能被用于主进程中，有些`API`又只能被用于渲染进程，又有一些主进程和渲染进程中都可以使用。

你可以通过如下方式获取`Electron API`

```js
const { BrowserWindow, ... } = require('electron')
```
下面是一些常用的`Electron API`：

![](http://www.conardli.top/img/electron/el_8_api.png)

在后面的章节我们会选择其中常用的模块进行详细介绍。


### 4.2 使用 Node.js 的 API

![](http://www.conardli.top/img/electron/el_9_node.png)


你可以同时在`Electron`的主进程和渲染进程使用`Node.js API`，)所有在`Node.js`可以使用的`API`，在`Electron`中同样可以使用。

```js
import {shell} from 'electron';
import os from 'os';

document.getElementById('btn').addEventListener('click', () => { 
  shell.showItemInFolder(os.homedir());
})
```

> 有一个非常重要的提示: 原生Node.js模块 (即指，需要编译源码过后才能被使用的模块) 需要在编译后才能和Electron一起使用。


### 4.3 进程通信

主进程和渲染进程虽然拥有不同的职责，然是他们也需要相互协作，互相通讯。

> 例如：在`web`页面管理原生`GUI`资源是很危险的，会很容易泄露资源。所以在`web`页面，不允许直接调用原生`GUI`相关的`API`。渲染进程如果想要进行原生的`GUI`操作，就必须和主进程通讯，请求主进程来完成这些操作。

![](http://www.conardli.top/img/electron/el_10_ipc.gif)

### 4.4 渲染进程向主进程通信


`ipcRenderer` 是一个 `EventEmitter` 的实例。 你可以使用它提供的一些方法从渲染进程发送同步或异步的消息到主进程。 也可以接收主进程回复的消息。

在渲染进程引入`ipcRenderer`：

```js
import { ipcRenderer } from 'electron';
```

异步发送：

通过 `channel` 发送同步消息到主进程，可以携带任意参数。 

 > 在内部，参数会被序列化为 `JSON`，因此参数对象上的函数和原型链不会被发送。

```js
ipcRenderer.send('sync-render', '我是来自渲染进程的异步消息');
```

同步发送：

```js
 const msg = ipcRenderer.sendSync('async-render', '我是来自渲染进程的同步消息');
```

> 注意: 发送同步消息将会阻塞整个渲染进程，直到收到主进程的响应。

主进程监听消息：

`ipcMain`模块是`EventEmitter`类的一个实例。 当在主进程中使用时，它处理从渲染器进程（网页）发送出来的异步和同步信息。 从渲染器进程发送的消息将被发送到该模块。

`ipcMain.on`：监听 `channel`，当接收到新的消息时 `listener` 会以 `listener(event, args...)` 的形式被调用。

```js
  ipcMain.on('sync-render', (event, data) => {
    console.log(data);
  });
```

### 4.5 主进程向渲染进程通信

https://imweb.io/topic/5b13a663d4c96b9b1b4c4e9c

在主进程中可以通过`BrowserWindow`的`webContents`向渲染进程发送消息，所以，在发送消息前你必须先找到对应渲染进程的`BrowserWindow`对象。：

```js
const mainWindow = BrowserWindow.fromId(global.mainId);
 mainWindow.webContents.send('main-msg', `ConardLi]`)
```

根据消息来源发送：

在`ipcMain`接受消息的回调函数中，通过第一个参数`event`的属性`sender`可以拿到消息来源渲染进程的`webContents`对象，我们可以直接用此对象回应消息。

```js
  ipcMain.on('sync-render', (event, data) => {
    console.log(data);
    event.sender.send('main-msg', '主进程收到了渲染进程的【异步】消息！')
  });
```

渲染进程监听：

`ipcRenderer.on`:监听 `channel`, 当新消息到达，将通过` listener(event, args...) `调用 `listener`。

```js
ipcRenderer.on('main-msg', (event, msg) => {
    console.log(msg);
})
```

### 4.6 通信原理

`ipcMain` 和 `ipcRenderer` 都是 `EventEmitter` 类的一个实例。`EventEmitter` 类是 `NodeJS` 事件的基础，它由 `NodeJS` 中的 `events` 模块导出。

`EventEmitter` 的核心就是事件触发与事件监听器功能的封装。它实现了事件模型需要的接口， 包括 `addListener，removeListener`, `emit` 及其它工具方法. 同原生 `JavaScript` 事件类似， 采用了发布/订阅(观察者)的方式， 使用内部 `_events` 列表来记录注册的事件处理器。

我们通过 `ipcMain`和`ipcRenderer` 的 `on、send` 进行监听和发送消息都是 `EventEmitter` 定义的相关接口。


### 4.7 remote

`remote` 模块为渲染进程（web页面）和主进程通信（`IPC`）提供了一种简单方法。 使用 `remote` 模块, 你可以调用 `main` 进程对象的方法, 而不必显式发送进程间消息, 类似于 `Java` 的 `RMI` 。

```js
import { remote } from 'electron';

remote.dialog.showErrorBox('主进程才有的dialog模块', '我是使用remote调用的')
```

![](http://www.conardli.top/img/electron/el_11_remote.gif)

但实际上，我们在调用远程对象的方法、函数或者通过远程构造函数创建一个新的对象，实际上都是在发送一个同步的进程间消息。

在上面通过 `remote` 模块调用 `dialog` 的例子里。我们在渲染进程中创建的 `dialog` 对象其实并不在我们的渲染进程中，它只是让主进程创建了一个 `dialog` 对象，并返回了这个相对应的远程对象给了渲染进程。


### 4.8 渲染进程间通信

`Electron`并没有提供渲染进程之间相互通信的方式，我们可以在主进程中建立一个消息中转站。

渲染进程之间通信首先发送消息到主进程，主进程的中转站接受到消息后根据条件进行分发。


### 4.9 渲染进程数据共享

在两个渲染进程间共享数据最简单的方法是使用浏览器中已经实现的` HTML5 API`。 其中比较好的方案是用` Storage API`， `localStorage，sessionStorage` 或者 `IndexedDB。`

就像在浏览器中使用一样，这种存储相当于在应用程序中永久存储了一部分数据。有时你并不需要这样的存储，只需要在当前应用程序的生命周期内进行一些数据的共享。这时你可以用 `Electron` 内的 `IPC` 机制实现。

将数据存在主进程的某个全局变量中，然后在多个渲染进程中使用 `remote` 模块来访问它。

![](http://www.conardli.top/img/electron/el_12_global.gif)

在主进程中初始化全局变量：

```js
global.mainId = ...;
global.device = {...};
global.__dirname = __dirname;
global.myField = { name: 'ConardLi' };
```

在渲染进程中读取：

```js
import { ipcRenderer, remote } from 'electron';

const { getGlobal } = remote;

const mainId = getGlobal('mainId')
const dirname = getGlobal('__dirname')
const deviecMac = getGlobal('device').mac;
```

在渲染进程中改变：

```js
getGlobal('myField').name = 'code秘密花园';
```

多个渲染进程共享同一个主进程的全局变量，这样即可达到渲染进程数据共享和传递的效果。



文中如有错误，欢迎在评论区指正，如果这篇文章帮助到了你，欢迎点赞和关注。