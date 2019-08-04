---
title: 用JS开发桌面应用（三）打印篇
date: 2019-06-10 20:45:35
tags:
     - electron
     - 多端开发
---

## 九、打印

很多情况下程序中使用的打印都是用户无感知的。并且想要灵活的控制打印内容，往往需要借助打印机给我们提供的`api`再进行开发，这种开发方式非常繁琐，并且开发难度较大。第一次在业务中用到`Electron`其实就是用到它的打印功能，这里就多介绍一些。

`Electron`提供的打印api可以非常灵活的控制打印设置的显示，并且可以通过html来书写打印内容。`Electron`提供了两种方式进行打印，一种是直接调用打印机打印，一种是打印到`pdf`。

并且有两种对象可以调用打印：

- 通过`window`的`webcontent`对象，使用此种方式需要单独开出一个打印的窗口，可以将该窗口隐藏，但是通信调用相对复杂。
- 使用页面的`webview`元素调用打印，可以将`webview`隐藏在调用的页面中，通信方式比较简单。

上面两种方式同时拥有`print`和`printToPdf`方法。

![](http://www.conardli.top/img/electron/el_23_print.gif)

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

`printToPdf`的用法基本和`print`相同，但是`print`的配置项非常少，而`printToPdf`则扩展了很多属性。这里翻了一下源码发现还有很多没有被贴进api的，大概有三十几个包括可以对打印的margin，打印页眉页脚等进行配置。

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

![](http://www.conardli.top/img/electron/el_24_print.png)

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

## 小结

希望你阅读本篇文章后可以达到以下几点：

- 了解`Electron`的基本运行原理
- 掌握`Electron`开发的核心基础知识
- 了解`Electron`关于弹框、打印、保护、打包等功能的基本使用

文中如有错误，欢迎在评论区指正，如果这篇文章帮助到了你，欢迎点赞和关注。