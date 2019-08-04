---
title: 用JS开发桌面应用（四）程序保护
date: 2019-06-10 20:45:35
tags:
     - electron
     - 多端开发
---

## 十、程序保护

https://segmentfault.com/a/1190000007503495

![](http://www.conardli.top/img/electron/el_22_protect.gif)

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

我们可以通过`webContents`的`crashed`来监听渲染进程的崩溃，另外经测试有些主进程的崩溃也会触发该事件。所以我们可以根据主`window`是否被销毁来判断进行不同的重启逻辑，下面使整个崩溃监控的逻辑：

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

文中如有错误，欢迎在评论区指正，如果这篇文章帮助到了你，欢迎点赞和关注。