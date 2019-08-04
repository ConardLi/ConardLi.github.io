---
title: 用JS开发桌面应用（五）终篇
date: 2019-06-10 20:45:35
tags:
     - electron
     - 多端开发
---

## 十一、扩展能力

![](http://www.conardli.top/img/electron/el_4_iot.jpg)

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

![](http://www.conardli.top/img/electron/el_14_env.png)

具体策略如下：

![](http://www.conardli.top/img/electron/el_15_env.png)

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

文中如有错误，欢迎在评论区指正，如果这篇文章帮助到了你，欢迎点赞和关注。