---
title: 用JS开发桌面应用（二）基本应用
date: 2019-06-10 20:45:35
tags:
     - electron
     - 多端开发
---

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


![](http://www.conardli.top/img/electron/el_13_window.gif)


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

![](http://www.conardli.top/img/electron/el_16_dialog.gif)

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

![](http://www.conardli.top/img/electron/el_17_sys.png)

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

![](http://www.conardli.top/img/electron/el_18_clipboard.gif)

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

![](http://www.conardli.top/img/electron/el_19_cap.gif)

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

![](http://www.conardli.top/img/electron/el_20_menu.png)

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

![](http://www.conardli.top/img/electron/el_21_memu.gif)

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

文中如有错误，欢迎在评论区指正，如果这篇文章帮助到了你，欢迎点赞和关注。