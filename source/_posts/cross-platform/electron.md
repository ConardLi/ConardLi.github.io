---
title: 用JS开发跨平台桌面应用，从原理到实践
category: 跨平台
tag: 
- 跨平台
- Electron
date: 2019-06-10
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


使用`Electron`开发客户端程序已经有一段时间了，整体感觉还是非常不错的，其中也遇到了一些坑点，本文是从【运行原理】到【实际应用】对`Electron`进行一次系统性的总结。【多图，长文预警～】

本文所有实例代码均在我的[github electron-react](https://github.com/ConardLi/electron-react)上，结合代码阅读文章效果更佳。另外`electron-react`还可作为使用`Electron + React  + Mobx + Webpack `技术栈的脚手架工程。

## 一、桌面应用程序

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1c9782ebcc1~tplv-t2oaga2asx-image.image)

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

不过，上面两种对前端开发人员太不友好了，基本是前端人员不会涉及的领域，但是在这个【大前端😅】的时代，前端开发者正在想方设法涉足各个领域，使用`WEB`技术开发客户端的方式横空出世。

### 1.3 WEB开发

使用`WEB`技术进行开发，利用浏览器引擎完成`UI`渲染，利用`Node.js`实现服务器端`JS`编程并可以调用系统`API`，可以把它想像成一个套了一个客户端外壳的`WEB`应用。

在界面上，`WEB`的强大生态为`UI`带来了无限可能，并且开发、维护成本相对较低，有`WEB`开发经验的前端开发者很容易上手进行开发。

本文就来着重介绍使用`WEB`技术开发客户端程序的技术之一【`electron`】

## 二、Electron

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1c918263a3b~tplv-t2oaga2asx-image.image)


`Electron`是由`Github`开发，用`HTML，CSS`和`JavaScript`来构建跨平台桌面应用程序的一个开源库。 `Electron`通过将`Chromium`和`Node.js`合并到同一个运行时环境中，并将其打包为`Mac，Windows`和`Linux`系统下的应用来实现这一目的。

### 2.1 使用Electron开发的理由：

- 使用具有强大生态的`Web`技术进行开发，开发成本低，可扩展性强，更炫酷的`UI`
- 跨平台，一套代码可打包为`Windows、Linux、Mac`三套软件，且编译快速
- 可直接在现有`Web`应用上进行扩展，提供浏览器不具备的能力
- 你是一个前端👨💻～


当然，我们也要认清它的缺点：性能比原生桌面应用要低，最终打包后的应用比原生应用大很多。

### 2.2 开发体验

**兼容性**

虽然你还在用`WEB`技术进行开发，但是你不用再考虑兼容性问题了，你只需要关心你当前使用`Electron`的版本对应`Chrome`的版本，一般情况下它已经足够新来让你使用最新的`API`和语法了，你还可以手动升级`Chrome`版本。同样的，你也不用考虑不同浏览器带的样式和代码兼容问题。

**Node环境**

这可能是很多前端开发者曾经梦想过的功能，在`WEB`界面中使用`Node.js`提供的强大`API`，这意味着你在`WEB`页面直接可以操作文件，调用系统`API`，甚至操作数据库。当然，除了完整的` Node API`，你还可以使用额外的几十万个`npm`模块。

**跨域**

你可以直接使用`Node`提供的`request`模块进行网络请求，这意味着你无需再被跨域所困扰。

**强大的扩展性**

借助`node-ffi`，为应用程序提供强大的扩展性（后面的章节会详细介绍）。

### 2.3 谁在用Electron

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1c91810fbd2~tplv-t2oaga2asx-image.image)

现在市面上已经有非常多的应用在使用`Electron`进行开发了，包括我们熟悉的`VS Code`客户端、`GitHub`客户端、`Atom`客户端等等。印象很深的，去年迅雷在发布迅雷X`10.1`时的文案：

> 从迅雷X 10.1版本开始，我们采用Electron软件框架完全重写了迅雷主界面。使用新框架的迅雷X可以完美支持2K、4K等高清显示屏，界面中的文字渲染也更加清晰锐利。从技术层面来说，新框架的界面绘制、事件处理等方面比老框架更加灵活高效，因此界面的流畅度也显著优于老框架的迅雷。至于具体提升有多大？您一试便知。

你可以打开`VS Code`，点击【帮助】【切换开发人员工具】来调试`VS Code`客户端的界面。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1c91990f811~tplv-t2oaga2asx-image.image)


## 三、Electron运行原理

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1c977d8d722~tplv-t2oaga2asx-image.image)

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

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1c9796221ef~tplv-t2oaga2asx-image.image)

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

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1c9d2e22a4a~tplv-t2oaga2asx-image.image)

在后面的章节我们会选择其中常用的模块进行详细介绍。


### 4.2 使用 Node.js 的 API

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1ca5937a1c0~tplv-t2oaga2asx-image.image)


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

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1ca6198ef03~tplv-t2oaga2asx-image.image)

### 4.4 渲染进程向主进程通信


`ipcRenderer` 是一个 `EventEmitter` 的实例。 你可以使用它提供的一些方法，从渲染进程发送同步或异步的消息到主进程。 也可以接收主进程回复的消息。

在渲染进程引入`ipcRenderer`：

```js
import { ipcRenderer } from 'electron';
```

异步发送：

通过 `channel` 发送同步消息到主进程，可以携带任意参数。 

 > 在内部，参数会被序列化为 `JSON`，因此参数对象上的函数和原型链不会被发送。

```js
ipcRenderer.send('async-render', '我是来自渲染进程的异步消息');
```

同步发送：

```js
 const msg = ipcRenderer.sendSync('sync-render', '我是来自渲染进程的同步消息');
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

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1de209ac278~tplv-t2oaga2asx-image.image)

但实际上，我们在调用远程对象的方法、函数或者通过远程构造函数创建一个新的对象，实际上都是在发送一个同步的进程间消息。

在上面通过 `remote` 模块调用 `dialog` 的例子里。我们在渲染进程中创建的 `dialog` 对象其实并不在我们的渲染进程中，它只是让主进程创建了一个 `dialog` 对象，并返回了这个相对应的远程对象给了渲染进程。


### 4.8 渲染进程间通信

`Electron`并没有提供渲染进程之间相互通信的方式，我们可以在主进程中建立一个消息中转站。

渲染进程之间通信首先发送消息到主进程，主进程的中转站接收到消息后根据条件进行分发。


### 4.9 渲染进程数据共享

在两个渲染进程间共享数据最简单的方法是使用浏览器中已经实现的` HTML5 API`。 其中比较好的方案是用` Storage API`， `localStorage，sessionStorage` 或者 `IndexedDB。`

就像在浏览器中使用一样，这种存储相当于在应用程序中永久存储了一部分数据。有时你并不需要这样的存储，只需要在当前应用程序的生命周期内进行一些数据的共享。这时你可以用 `Electron` 内的 `IPC` 机制实现。

将数据存在主进程的某个全局变量中，然后在多个渲染进程中使用 `remote` 模块来访问它。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1de212d8b54~tplv-t2oaga2asx-image.image)

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


## 五、窗口

### 5.1 BrowserWindow

主进程模块`BrowserWindow`用于创建和控制浏览器窗口。

```js
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    // ...
  });
  mainWindow.loadURL('http://www.conardli.top/');
```

你可以在[这里](https://electronjs.org/docs/api/browser-window#new-browserwindowoptions)查看它所有的构造参数。


![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1ccd2ea6828~tplv-t2oaga2asx-image.image)


### 5.2 无框窗口

> 无框窗口是没有镶边的窗口，窗口的部分（如工具栏）不属于网页的一部分。

在`BrowserWindow`的构造参数中，将`frame`设置为`false`可以指定窗口为无边框窗口，将工具栏隐藏后，就会产生两个问题：

- 1.窗口控制按钮（最小化、全屏、关闭按钮）会被隐藏
- 2.无法拖拽移动窗口

可以通过指定`titleBarStyle`选项来再将工具栏按钮显示出来，将其设置为`hidden`表示返回一个隐藏标题栏的全尺寸内容窗口，在左上角仍然有标准的窗口控制按钮。

```js
new BrowserWindow({
    width: 200,
    height: 200,
    titleBarStyle: 'hidden',
    frame: false
  });
```
### 5.3 窗口拖拽

默认情况下, 无边框窗口是不可拖拽的。我们可以在界面中通过`CSS`属性`-webkit-app-region: drag`手动制定拖拽区域。

在无框窗口中, 拖动行为可能与选择文本冲突，可以通过设定`-webkit-user-select: none;`禁用文本选择：

```css
.header {
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
```

> 相反的，在可拖拽区域内部设置 `-webkit-app-region: no-drag `则可以指定特定不可拖拽区域。

### 5.4 透明窗口

通过将`transparent`选项设置为`true`, 还可以使无框窗口透明:

```js
new BrowserWindow({
    transparent: true,
    frame: false
  });
```

### 5.5 Webview

使用 `webview` 标签在`Electron` 应用中嵌入 "外来" 内容。外来内容包含在 `webview` 容器中。 应用中的嵌入页面可以控制外来内容的布局和重绘。

与 `iframe` 不同, `webview` 在与应用程序不同的进程中运行。它与您的网页没有相同的权限, 应用程序和嵌入内容之间的所有交互都将是异步的。

## 六、对话框

`dialog` 模块提供了`api`来展示原生的系统对话框，例如打开文件框，`alert`框，所以`web`应用可以给用户带来跟系统应用相同的体验。

> 注意：dialog是主进程模块，想要在渲染进程调用可以使用remote

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1cd641a0986~tplv-t2oaga2asx-image.image)

### 6.1 错误提示

`dialog.showErrorBox`用于显示一个显示错误消息的模态对话框。

```js
 remote.dialog.showErrorBox('错误', '这是一个错误弹框！')
```

### 6.2 对话框

`dialog.showErrorBox`用于调用系统对话框，可以为指定几种不同的类型： "`none`", "`info`", "`error`", "`question`" 或者 "`warning`"。

> 在 Windows 上, "question" 与"info"显示相同的图标, 除非你使用了 "icon" 选项设置图标。 在 macOS 上, "warning" 和 "error" 显示相同的警告图标

```js
remote.dialog.showMessageBox({
  type: 'info',
  title: '提示信息',
  message: '这是一个对话弹框！',
  buttons: ['确定', '取消']
}, (index) => {
  this.setState({ dialogMessage: `【你点击了${index ? '取消' : '确定'}！！】` })
})
```

### 6.3 文件框

`dialog.showOpenDialog`用于打开或选择系统目录。

```js
remote.dialog.showOpenDialog({
  properties: ['openDirectory', 'openFile']
}, (data) => {
  this.setState({ filePath: `【选择路径：${data[0]}】 ` })
})
```

### 6.4 信息框

这里推荐直接使用`HTML5 API`，它只能在渲染器进程中使用。

```js
let options = {
  title: '信息框标题',
  body: '我是一条信息～～～',
}
let myNotification = new window.Notification(options.title, options)
myNotification.onclick = () => {
  this.setState({ message: '【你点击了信息框！！】' })
}
```

## 七、系统

### 7.1 获取系统信息

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1cebfd523b7~tplv-t2oaga2asx-image.image)

通过`remote`获取到主进程的`process`对象，可以获取到当前应用的各个版本信息：

- `process.versions.electron`：`electron`版本信息
- `process.versions.chrome`：`chrome`版本信息
- `process.versions.node`：`node`版本信息
- `process.versions.v8`：`v8`版本信息

获取当前应用根目录：

```js
remote.app.getAppPath()
```

使用`node`的`os`模块获取当前系统根目录：

```js
os.homedir();
```

### 7.2 复制粘贴

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1d00a0313f7~tplv-t2oaga2asx-image.image)

`Electron`提供的`clipboard`在渲染进程和主进程都可使用，用于在系统剪贴板上执行复制和粘贴操作。

以纯文本的形式写入剪贴板：

```js
clipboard.writeText(text[, type])
```

以纯文本的形式获取剪贴板的内容：

```js
clipboard.readText([type])
```

### 7.3 截图

`desktopCapturer`用于从桌面捕获音频和视频的媒体源的信息。它只能在渲染进程中被调用。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1d058a5bece~tplv-t2oaga2asx-image.image)

下面的代码是一个获取屏幕截图并保存的实例：


```js
  getImg = () => {
    this.setState({ imgMsg: '正在截取屏幕...' })
    const thumbSize = this.determineScreenShotSize()
    let options = { types: ['screen'], thumbnailSize: thumbSize }
    desktopCapturer.getSources(options, (error, sources) => {
      if (error) return console.log(error)
      sources.forEach((source) => {
        if (source.name === 'Entire screen' || source.name === 'Screen 1') {
          const screenshotPath = path.join(os.tmpdir(), 'screenshot.png')
          fs.writeFile(screenshotPath, source.thumbnail.toPNG(), (error) => {
            if (error) return console.log(error)
            shell.openExternal(`file://${screenshotPath}`)
            this.setState({ imgMsg: `截图保存到: ${screenshotPath}` })
          })
        }
      })
    })
  }

  determineScreenShotSize = () => {
    const screenSize = screen.getPrimaryDisplay().workAreaSize
    const maxDimension = Math.max(screenSize.width, screenSize.height)
    return {
      width: maxDimension * window.devicePixelRatio,
      height: maxDimension * window.devicePixelRatio
    }
  }

```

## 八、菜单

应用程序的菜单可以帮助我们快捷的到达某一功能，而不借助客户端的界面资源，一般菜单分为两种：

- 应用程序菜单：位于应用程序顶部，在全局范围内都能使用
- 上下文菜单：可自定义任意页面显示，自定义调用，如右键菜单

`Electron`为我们提供了`Menu`模块用于创建本机应用程序菜单和上下文菜单，它是一个主进程模块。

你可以通过`Menu`的静态方法`buildFromTemplate(template)`，使用自定义菜单模版来构造一个菜单对象。

`template`是一个`MenuItem`的数组，我们来看看`MenuItem`的几个重要参数：

- `label`：菜单显示的文字
- `click`：点击菜单后的事件处理函数
- `role`：系统预定义的菜单，例如`copy`(复制)、`paste`(粘贴)、`minimize`(最小化)...
- `enabled`：指示是否启用该项目，此属性可以动态更改
- `submenu`：子菜单，也是一个`MenuItem`的数组

> 推荐：最好指定role与标准角色相匹配的任何菜单项，而不是尝试手动实现click函数中的行为。内置role行为将提供最佳的本地体验。

下面的实例是一个简单的额菜单`template`。

```js
const template = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建文件',
        click: function () {
          dialog.showMessageBox({
            type: 'info',
            message: '嘿!',
            detail: '你点击了新建文件！',
          })
        }
      }
    ]
  },
  {
    label: '编辑',
    submenu: [{
      label: '剪切',
      role: 'cut'
    }, {
      label: '复制',
      role: 'copy'
    }, {
      label: '粘贴',
      role: 'paste'
    }]
  },
  {
    label: '最小化',
    role: 'minimize'
  }
]
```

### 8.1 应用程序菜单

使用`Menu`的静态方法`setApplicationMenu`，可创建一个应用程序菜单，在 `Windows` 和 `Linux` 上，`menu`将被设置为每个窗口的顶层菜单。

> 注意：必须在模块ready事件后调用此 API app。

我们可以根据应用程序不同的的生命周期，不同的系统对菜单做不同的处理。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1d0717763e0~tplv-t2oaga2asx-image.image)

```js
app.on('ready', function () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

app.on('browser-window-created', function () {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', function () {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = true
})

if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
  addUpdateMenuItems(helpMenu, 0)
}
```

### 8.2 上下文菜单

使用`Menu`的实例方法`menu.popup`可自定义弹出上下文菜单。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1eeb6466cbd~tplv-t2oaga2asx-image.image)

```js
    let m = Menu.buildFromTemplate(template)
    document.getElementById('menuDemoContainer').addEventListener('contextmenu', (e) => {
      e.preventDefault()
      m.popup({ window: remote.getCurrentWindow() })
    })
```

### 8.3 快捷键

在菜单选项中，我们可以指定一个`accelerator`属性来指定操作的快捷键：

```js
  {
    label: '最小化',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }
```

另外，我们还可以使用`globalShortcut`来注册全局快捷键。

```js
    globalShortcut.register('CommandOrControl+N', () => {
      dialog.showMessageBox({
        type: 'info',
        message: '嘿!',
        detail: '你触发了手动注册的快捷键.',
      })
    })
```

> CommandOrControl代表在macOS上为Command键，以及在Linux和Windows上为Control键。

## 九、打印

很多情况下程序中使用的打印都是用户无感知的。并且想要灵活的控制打印内容，往往需要借助打印机给我们提供的`api`再进行开发，这种开发方式非常繁琐，并且开发难度较大。第一次在业务中用到`Electron`其实就是用到它的打印功能，这里就多介绍一些。

`Electron`提供的打印api可以非常灵活的控制打印设置的显示，并且可以通过html来书写打印内容。`Electron`提供了两种方式进行打印，一种是直接调用打印机打印，一种是打印到`pdf`。

并且有两种对象可以调用打印：

- 通过`window`的`webcontent`对象，使用此种方式需要单独开出一个打印的窗口，可以将该窗口隐藏，但是通信调用相对复杂。
- 使用页面的`webview`元素调用打印，可以将`webview`隐藏在调用的页面中，通信方式比较简单。

上面两种方式同时拥有`print`和`printToPdf`方法。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1d12f9121dc~tplv-t2oaga2asx-image.image)

### 9.1 调用系统打印

```js
contents.print([options], [callback])；
```

打印配置(options)中只有简单的三个配置：

- `silent`：打印时是否不展示打印配置（是否静默打印）
- `printBackground`：是否打印背景
- `deviceName`：打印机设备名称

首先要将我们使用的打印机名称配置好，并且要在调用打印前首先要判断打印机是否可用。

使用`webContents`的`getPrinters`方法可获取当前设备已经配置的打印机列表，注意配置过不是可用，只是在此设备上安装过驱动。

通过`getPrinters`获取到的打印机对象：https://electronjs.org/docs/api/structures/printer-info

我们这里只管关心两个，`name`和`status`，`status`为`0`时表示打印机可用。

`print`的第二个参数`callback`是用于判断打印任务是否发出的回调，而不是打印任务完成后的回调。所以一般打印任务发出，回调函数即会调用并返回参数`true`。这个回调并不能判断打印是否真的成功了。

```js
    if (this.state.curretnPrinter) {
      mainWindow.webContents.print({
        silent: silent, printBackground: true, deviceName: this.state.curretnPrinter
      }, () => { })
    } else {
      remote.dialog.showErrorBox('错误', '请先选择一个打印机！')
    }
```

### 9.2 打印到PDF

`printToPdf`的用法基本和`print`相同，但是`print`的配置项非常少，而`printToPdf`则扩展了很多属性。这里翻了一下源码发现还有很多没有被贴进文档的，大概有三十几个，包括可以对打印的margin，打印页眉页脚等进行配置。

```js
contents.printToPDF(options, callback)
```

`callback`函数在打印失败或打印成功后调用，可获取打印失败信息或包含`PDF`数据的缓冲区。

```js
    const pdfPath = path.join(os.tmpdir(), 'webviewPrint.pdf');
    const webview = document.getElementById('printWebview');
    const renderHtml = '我是被临时插入webview的内容...';
    webview.executeJavaScript('document.documentElement.innerHTML =`' + renderHtml + '`;');
    webview.printToPDF({}, (err, data) => {
      console.log(err, data);
      fs.writeFile(pdfPath, data, (error) => {
        if (error) throw error
        shell.openExternal(`file://${pdfPath}`)
        this.setState({ webviewPdfPath: pdfPath })
      });
    });
```

> 这个例子中的打印是使用`webview`完成的，通过调用`executeJavaScript`方法可动态向`webview`插入打印内容。

### 9.3 两种打印方案的选择

上面提到，使用`webview`和`webcontent`都可以调用打印功能，使用`webcontent`打印，首先要有一个打印窗口，这个窗口不能随时打印随时创建，比较耗费性能。可以将它在程序运行时启动好，并做好事件监听。

此过程需和调用打印的进行做好通信，大致过程如下：

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1de2493ff0f~tplv-t2oaga2asx-image.image)

可见通信非常繁琐，使用`webview`进行打印可实现同样的效果但是通信方式会变得简单，因为渲染进程和`webview`通信不需要经过主进程，通过如下方式即可：

```js
  const webview = document.querySelector('webview')
  webview.addEventListener('ipc-message', (event) => {
    console.log(event.channel)
  })
  webview.send('ping')；

  const {ipcRenderer} = require('electron')
  ipcRenderer.on('ping', () => {
    ipcRenderer.sendToHost('pong')
  })
```

之前专门为`ELectron`打印写过一个`DEMO`：[electron-print-demo](https://github.com/ConardLi/electron-print-demo)有兴趣可以`clone`下来看一下。

### 9.4 打印功能封装

下面是几个针对常用打印功能的工具函数封装。 

```js
/**
 * 获取系统打印机列表
 */
export function getPrinters() {
  let printers = [];
  try {
    const contents = remote.getCurrentWindow().webContents;
    printers = contents.getPrinters();
  } catch (e) {
    console.error('getPrintersError', e);
  }
  return printers;
}
/**
 * 获取系统默认打印机
 */
export function getDefaultPrinter() {
  return getPrinters().find(element => element.isDefault);
}
/**
 * 检测是否安装了某个打印驱动
 */
export function checkDriver(driverMame) {
  return getPrinters().find(element => (element.options["printer-make-and-model"] || '').includes(driverMame));
}
/**
 * 根据打印机名称获取打印机对象
 */
export function getPrinterByName(name) {
  return getPrinters().find(element => element.name === name);
}

```

## 十、程序保护

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1f9e1249700~tplv-t2oaga2asx-image.image)

###  10.1 崩溃

崩溃监控是每个客户端程序必备的保护功能，当程序崩溃时我们一般期望做到两件事：

- 1.上传崩溃日志，及时报警
- 2.监控程序崩溃，提示用户重启程序

`electron`为我们提供给了`crashReporter`来帮助我们记录崩溃日志，我们可以通过`crashReporter.start`来创建一个崩溃报告器：

```js
const { crashReporter } = require('electron')
crashReporter.start({
  productName: 'YourName',
  companyName: 'YourCompany',
  submitURL: 'https://your-domain.com/url-to-submit',
  uploadToServer: true
})
```

当程序发生崩溃时，崩溃报日志将被储存在临时文件夹中名为`YourName Crashes`的文件文件夹中。`submitURL`用于指定你的崩溃日志上传服务器。 在启动崩溃报告器之前，您可以通过调用`app.setPath('temp', 'my/custom/temp') `API来自定义这些临时文件的保存路径。你还可以通过`crashReporter.getLastCrashReport()`来获取上次崩溃报告的日期和`ID`。

我们可以通过`webContents`的`crashed`来监听渲染进程的崩溃，另外经测试有些主进程的崩溃也会触发该事件。所以我们可以根据主`window`是否被销毁来判断进行不同的重启逻辑，下面是整个崩溃监控的逻辑：

```js
import { BrowserWindow, crashReporter, dialog } from 'electron';
// 开启进程崩溃记录
crashReporter.start({
  productName: 'electron-react',
  companyName: 'ConardLi',
  submitURL: 'http://xxx.com',  // 上传崩溃日志的接口
  uploadToServer: false
});
function reloadWindow(mainWin) {
  if (mainWin.isDestroyed()) {
    app.relaunch();
    app.exit(0);
  } else {
    // 销毁其他窗口
    BrowserWindow.getAllWindows().forEach((w) => {
      if (w.id !== mainWin.id) w.destroy();
    });
    const options = {
      type: 'info',
      title: '渲染器进程崩溃',
      message: '这个进程已经崩溃.',
      buttons: ['重载', '关闭']
    }
    dialog.showMessageBox(options, (index) => {
      if (index === 0) mainWin.reload();
      else mainWin.close();
    })
  }
}
export default function () {
  const mainWindow = BrowserWindow.fromId(global.mainId);
  mainWindow.webContents.on('crashed', () => {
    const errorMessage = crashReporter.getLastCrashReport();
    console.error('程序崩溃了！', errorMessage); // 可单独上传日志
    reloadWindow(mainWindow);
  });
}
```

### 10.2 最小化到托盘

有的时候我们并不想让用户通过点关闭按钮的时候就关闭程序，而是把程序最小化到托盘，在托盘上做真正的退出操作。

首先要监听窗口的关闭事件，阻止用户关闭操作的默认行为，将窗口隐藏。

```js
function checkQuit(mainWindow, event) {
  const options = {
    type: 'info',
    title: '关闭确认',
    message: '确认要最小化程序到托盘吗？',
    buttons: ['确认', '关闭程序']
  };
  dialog.showMessageBox(options, index => {
    if (index === 0) {
      event.preventDefault();
      mainWindow.hide();
    } else {
      mainWindow = null;
      app.exit(0);
    }
  });
}
function handleQuit() {
  const mainWindow = BrowserWindow.fromId(global.mainId);
  mainWindow.on('close', event => {
    event.preventDefault();
    checkQuit(mainWindow, event);
  });
}
```

这时程序就再也找不到了，任务托盘中也没有我们的程序，所以我们要先创建好任务托盘，并做好事件监听。

> windows平台使用`ico`文件可以达到更好的效果

```js
export default function createTray() {
  const mainWindow = BrowserWindow.fromId(global.mainId);
  const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png'
  tray = new Tray(path.join(global.__dirname, iconName));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主界面', click: () => {
        mainWindow.show();
        mainWindow.setSkipTaskbar(false);
      }
    },
    {
      label: '退出', click: () => {
        mainWindow.destroy();
        app.quit();
      }
    },
  ])
  tray.setToolTip('electron-react');
  tray.setContextMenu(contextMenu);
}
```

## 十一、扩展能力

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1d6acbcdede~tplv-t2oaga2asx-image.image)

在很多情况下，你的应用程序要和外部设备进行交互，一般情况下厂商会为你提供硬件设备的开发包，这些开发包基本上都是通过`C++` 编写，在使用`electron`开发的情况下，我们并不具备直接调用`C++`代码的能力，我们可以利用`node-ffi`来实现这一功能。

`node-ffi`提供了一组强大的工具，用于在`Node.js`环境中使用纯`JavaScript`调用动态链接库接口。它可以用来为库构建接口绑定，而不需要使用任何`C++`代码。

> 注意`node-ffi`并不能直接调用`C++`代码，你需要将`C++`代码编译为动态链接库：在 `Windows`下是 `Dll` ，在 `Mac OS `下是 `dylib` `，Linux` 是 `so` 。

> `node-ffi` 加载 `Library`是有限制的，只能处理 `C`风格的 `Library`。 

下面是一个简单的实例：

```js
const ffi = require('ffi');
const ref = require('ref');
const SHORT_CODE = ref.refType('short');


const DLL = new ffi.Library('test.dll', {
    Test_CPP_Method: ['int', ['string',SHORT_CODE]], 
  })

testCppMethod(str: String, num: number): void {
  try {
    const result: any = DLL.Test_CPP_Method(str, num);
    return result;
  } catch (error) {
    console.log('调用失败～',error);
  }
}

this.testCppMethod('ConardLi',123);
```

上面的代码中，我们用`ffi`包装`C++`接口生成的动态链接库`test.dll`，并使用`ref`进行一些类型映射。

使用`JavaScript`调用这些映射方法时，推荐使用`TypeScript`来约定参数类型，因为弱类型的`JavaScript`在调用强类型语言的接口时可能会带来意想不到的风险。

借助这一能力，前端开发工程师也可以在`IOT`领域一展身手了😎～

## 十二、环境选择

一般情况下，我们的应用程序可能运行在多套环境下（`production`、`beta`、`uat`、`moke`、`development`...），不同的开发环境可能对应不同的后端接口或者其他配置，我们可以在客户端程序中内置一个简单的环境选择功能来帮助我们更高效的开发。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1d71f9463bd~tplv-t2oaga2asx-image.image)

具体策略如下：

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/10/16b3d1d745caac21~tplv-t2oaga2asx-image.image)

- 在开发环境中，我们直接进入环境选择页面，读取到选择的环境后进行响应的重定向操作
- 在菜单保留环境选择入口，以便在开发过程中切换

```js
const envList = ["moke", "beta", "development", "production"];
exports.envList = envList;
const urlBeta = 'https://wwww.xxx-beta.com';
const urlDev = 'https://wwww.xxx-dev.com';
const urlProp = 'https://wwww.xxx-prop.com';
const urlMoke = 'https://wwww.xxx-moke.com';
const path = require('path');
const pkg = require(path.resolve(global.__dirname, 'package.json'));
const build = pkg['build-config'];
exports.handleEnv = {
  build,
  currentEnv: 'moke',
  setEnv: function (env) {
    this.currentEnv = env
  },
  getUrl: function () {
    console.log('env:', build.env);
    if (build.env === 'production' || this.currentEnv === 'production') {
      return urlProp;
    } else if (this.currentEnv === 'moke') {
      return urlMoke;
    } else if (this.currentEnv === 'development') {
      return urlDev;
    } else if (this.currentEnv === "beta") {
      return urlBeta;
    }
  },
  isDebugger: function () {
    return build.env === 'development'
  }
}
```

## 十三、打包

最后也是最重要的一步，将写好的代码打包成可运行的`.app`或`.exe`可执行文件。

这里我把打包氛围两部分来做，渲染进程打包和主进程打包。

### 13.1 渲染进程打包和升级

一般情况下，我们的大部分业务逻辑代码是在渲染进程完成的，在大部分情况下我们仅仅需要对渲染进程进行更新和升级而不需要改动主进程代码，我们渲染进程的打包实际上和一般的`web`项目打包没有太大差别，使用`webpack`打包即可。

这里我说说渲染进程单独打包的好处：

打包完成的`html`和`js`文件，我们一般要上传到我们的前端静态资源服务器下，然后告知服务端我们的渲染进程有代码更新，这里可以说成渲染进程单独的升级。

注意，和壳的升级不同，渲染进程的升级仅仅是静态资源服务器上`html`和`js`文件的更新，而不需要重新下载更新客户端，这样我们每次启动程序的时候检测到离线包有更新，即可直接刷新读取最新版本的静态资源文件，即使在程序运行过程中要强制更新，我们的程序只需要强制刷新页面读取最新的静态资源即可，这样的升级对用户是非常友好的。

这里注意，一旦我们这样配置，就意味着渲染进程和主进程打包升级的完全分离，我们在启动主窗口时读取的文件就不应该再是本地文件，而是打包完成后放在静态资源服务器的文件。

为了方便开发，这里我们可以区分本地和线上加载不同的文件：

```js
function getVersion (mac,current){
  // 根据设备mac和当前版本获取最新版本
}
export default function () {
  if (build.env === 'production') {
    const version = getVersion (mac,current);
    return 'https://www.xxxserver.html/electron-react/index_'+version+'.html';
  }
  return url.format({
    protocol: 'file:',
    pathname: path.join(__dirname, 'env/environment.html'),
    slashes: true,
    query: { debugger: build.env === "development" }
  });
}
```

具体的`webpack`配置这里就不再贴出，可以到我的[`github` `electron-react`](https://github.com/ConardLi/electron-react/tree/master/scripts)的`/scripts`目录下查看。

这里需要注意，在开发环境下我们可以结合`webpack`的`devServer`和`electron`命令来启动`app`：

```js
  devServer: {
    contentBase: './assets/',
    historyApiFallback: true,
    hot: true,
    port: PORT,
    noInfo: false,
    stats: {
      colors: true,
    },
    setup() {
      spawn(
        'electron',
        ['.'],
        {
          shell: true,
          stdio: 'inherit',
        }
      )
        .on('close', () => process.exit(0))
        .on('error', e => console.error(e));
    },
  },//...
```

### 13.2 主进程打包

 主进程，即将整个程序打包成可运行的客户端程序，常用的打包方案一般有两种，`electron-packager`和`electron-builder`。

 `electron-packager`在打包配置上我觉得有些繁琐，而且它只能将应用直接打包为可执行程序。
 
 这里我推荐使用`electron-builder`，它不仅拥有方便的配置 `protocol` 的功能、内置的 `Auto Update`、简单的配置 `package.json` 便能完成整个打包工作，用户体验非常不错。而且`electron-builder`不仅能直接将应用打包成`exe app`等可执行程序，还能打包成`msi dmg`等安装包格式。

 你可以在`package.json`方便的进行各种配置：

 ```js
  "build": {
    "productName": "electron-react", // app中文名称
    "appId": "electron-react",// app标识
    "directories": { // 打包后输出的文件夹
      "buildResources": "resources",
      "output": "dist/"
    }
    "files": [ // 打包后依然保留的源文件
      "main_process/",
      "render_process/",
    ],
    "mac": { // mac打包配置
      "target": "dmg",
      "icon": "icon.ico"
    },
    "win": { // windows打包配置
      "target": "nsis",
      "icon": "icon.ico"
    },
    "dmg": { // dmg文件打包配置
      "artifactName": "electron_react.dmg",
      "contents": [
        {
          "type": "link",
          "path": "/Applications",
          "x": 410,
          "y": 150
        },
        {
          "type": "file",
          "x": 130,
          "y": 150
        }
      ]
    },
    "nsis": { // nsis文件打包配置
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "shortcutName": "electron-react"
    },
  }
 ```

 执行`electron-builder`打包命令时，可指定参数进行打包。

 ```js
  --mac, -m, -o, --macos   macOS打包
  --linux, -l              Linux打包
  --win, -w, --windows     Windows打包
  --mwl                    同时为macOS，Windows和Linux打包
  --x64                    x64 (64位安装包)
  --ia32                   ia32(32位安装包) 
 ```

 关于主进程的更新你可以使用`electron-builder`自带的`Auto Update`模块，在`electron-react`也实现了手动更新的模块，由于篇幅原因这里就不再赘述，如果有兴趣可以到我的[`github`](https://github.com/ConardLi/electron-react/tree/master/scripts)查看`main`下的`update`模块。

### 13.3 打包优化

`electron-builder`打包出来的`App`要比相同功能的原生客户端应用体积大很多，即使是空的应用，体积也要在`100mb`以上。原因有很多：

第一点；为了达到跨平台的效果，每个`Electron`应用都包含了整个`V8`引擎和`Chromium`内核。

第二点：打包时会将整个`node_modules`打包进去，大家都知道一个应用的`node_module`体积是非常庞大的，这也是使得`Electron`应用打包后的体积较大的原因。

第一点我们无法改变，我们可以从第二点对应用体积进行优化：`Electron`在打包时只会将`denpendencies`的依赖打包进去，而不会将 `devDependencies` 中的依赖进行打包。所以我们应尽可能的减少`denpendencies`中的依赖。在上面的进程中，我们使用`webpack`对渲染进程进行打包，所以渲染进程的依赖全部都可以移入`devDependencies`。

另外，我们还可以使用双`packajson.json`的方式来进行优化，把只在开发环境中使用到的依赖放在整个项目的根目录的`package.json`下，将与平台相关的或者运行时需要的依赖装在`app`目录下。具体详见[two-package-structure](https://www.electron.build/tutorials/two-package-structure)。

## 参考

- https://electronjs.org/docs
- http://jlord.us/essential-electron/
- https://imweb.io/topic/5b9f500cc2ec8e6772f34d79
- https://www.jianshu.com/p/1ece6fd7a80c
- https://zhuanlan.zhihu.com/p/52991793

> 本项目源码地址：https://github.com/ConardLi/electron-react

## 小结

希望你阅读本篇文章后可以达到以下几点：

- 了解`Electron`的基本运行原理
- 掌握`Electron`开发的核心基础知识
- 了解`Electron`关于弹框、打印、保护、打包等功能的基本使用

如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。


