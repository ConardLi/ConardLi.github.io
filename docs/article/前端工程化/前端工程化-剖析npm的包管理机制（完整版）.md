---
title: 剖析npm的包管理机制（完整版）
date: 2019-12-28 11:11:00
tags:
     - 工程化
---

## 导读

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191216212546.png)

现如今，前端开发的同学已经离不开 `npm` 这个包管理工具，其优秀的包版本管理机制承载了整个繁荣发展的`NodeJS`社区，理解其内部机制非常有利于加深我们对模块开发的理解、各项前端工程化的配置以加快我们排查问题（相信不少同学收到过各种依赖问题的困扰）的速度。

本文从三个角度：`package.json`、版本管理、依赖安装结合具体实例对 `npm` 的包管理机制进行了详细分析。

## 一、剖析 package.json

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191128214129.png)

在 `Node.js` 中，模块是一个库或框架，也是一个 `Node.js` 项目。`Node.js` 项目遵循模块化的架构，当我们创建了一个 `Node.js` 项目，意味着创建了一个模块，这个模块必须有一个描述文件，即 `package.json`。它是我们最常见的配置文件，但是它里面的配置你真的有详细了解过吗？配置一个合理的 `package.json` 文件直接决定着我们项目的质量，所以首先带大家分析下 `package.json` 的各项详细配置。

### 1.1 必备属性

`package.json` 中有非常多的属性，其中必须填写的只有两个：`name` 和 `version` ，这两个属性组成一个 `npm` 模块的唯一标识。

#### npm包命名规则

`name` 即模块名称，其命名时需要遵循官方的一些规范和建议：

- 包名会成为模块`url`、命令行中的一个参数或者一个文件夹名称，任何非`url`安全的字符在包名中都不能使用，可以使用 `validate-npm-package-name` 包来检测包名是否合法。

- 语义化包名，可以帮助开发者更快的找到需要的包，并且避免意外获取错误的包。

- 若包名称中存在一些符号，将符号去除后不得与现有包名重复

例如：由于`react-native`已经存在，`react.native`、`reactnative`都不可以再创建。

- 如果你的包名与现有的包名太相近导致你不能发布这个包，那么推荐将这个包发布到你的作用域下。

例如：用户名 `conard`，那么作用域为 `@conard`，发布的包可以是`@conard/react`。


#### 查看包是否被占用

`name` 是一个包的唯一标识，不得和其他包名重复，我们可以执行 `npm view packageName` 查看包是否被占用，并可以查看它的一些基本信息：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191122203045.png)

若包名称从未被使用过，则会抛出 `404` 错误：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191122203304.png)

另外，你还可以去 `https://www.npmjs.com/` 查询更多更详细的包信息。


### 1.2描述信息

#### 基本描述

```json
{
  "description": "An enterprise-class UI design language and React components implementation",
  "keywords": [
    "ant",
    "component",
    "components",
    "design",
    "framework",
    "frontend",
    "react",
    "react-component",
    "ui"
  ]
}
```

`description`用于添加模块的的描述信息，方便别人了解你的模块。

`keywords`用于给你的模块添加关键字。


当然，他们的还有一个非常重要的作用，就是利于模块检索。当你使用 `npm search` 检索模块时，会到`description` 和 `keywords` 中进行匹配。写好 `description` 和 `keywords` 有利于你的模块获得更多更精准的曝光：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191120215031.png)

#### 开发人员

描述开发人员的字段有两个：`author` 和 `contributors`， `author` 指包的主要作者，一个 `author` 对应一个人。 `contributors` 指贡献者信息，一个 `contributors` 对应多个贡献者，值为数组，对人的描述可以是一个字符串，也可以是下面的结构：

```json
{ 
    "name" : "ConardLi", 
    "email" : "lisqPersion@163.com", 
    "url" : "https://github.com/ConardLi"
}
```

#### 地址

```json
{
  "homepage": "http://ant.design/",
  "bugs": {
    "url": "https://github.com/ant-design/ant-design/issues"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/ant-design/ant-design"
  },
}
```

`homepage` 用于指定该模块的主页。

`repository` 用于指定模块的代码仓库。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191120215411.png)

`bugs` 指定一个地址或者一个邮箱，对你的模块存在疑问的人可以到这里提出问题。


### 1.3 依赖配置

我们的项目可能依赖一个或多个外部依赖包，根据依赖包的不同用途，我们将他们配置在下面几个属性下：`dependencies、devDependencies、peerDependencies、bundledDependencies、optionalDependencies`。

#### 配置规则

在介绍几种依赖配置之前，首先我们来看一下依赖的配置规则，你看到的依赖包配置可能是下面这样的：

```json
 "dependencies": {
      "antd": "ant-design/ant-design#4.0.0-alpha.8",
      "axios": "^1.2.0",
      "test-js": "file:../test",
      "test2-js": "http://cdn.com/test2-js.tar.gz",
      "core-js": "^1.1.5",
 }
```

依赖配置遵循下面几种配置规则：

- `依赖包名称:VERSION`
  - `VERSION`是一个遵循`SemVer`规范的版本号配置，`npm install` 时将到npm服务器下载符合指定版本范围的包。
- `依赖包名称:DWONLOAD_URL`
  -  `DWONLOAD_URL` 是一个可下载的`tarball`压缩包地址，模块安装时会将这个`.tar`下载并安装到本地。
- `依赖包名称:LOCAL_PATH`
  -  `LOCAL_PATH` 是一个本地的依赖包路径，例如 `file:../pacakges/pkgName`。适用于你在本地测试一个`npm`包，不应该将这种方法应用于线上。
- `依赖包名称:GITHUB_URL`
  - `GITHUB_URL` 即 `github` 的 `username/modulename` 的写法，例如：`ant-design/ant-design`，你还可以在后面指定 `tag` 和 `commit id`。
- `依赖包名称:GIT_URL`
  - `GIT_URL` 即我们平时clone代码库的 `git url`，其遵循以下形式：

```js
<protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish> | #semver:<semver>]
```

其中 `protocal` 可以是以下几种形式：

- `git://github.com/user/project.git#commit-ish`
- `git+ssh://user@hostname:project.git#commit-ish`
- `git+ssh://user@hostname/project.git#commit-ish`
- `git+http://user@hostname/project/blah.git#commit-ish`
- `git+https://user@hostname/project/blah.git#commit-ish`


#### dependencies

`dependencies` 指定了项目运行所依赖的模块，开发环境和生产环境的依赖模块都可以配置到这里，例如

```json
 "dependencies": {
      "lodash": "^4.17.13",
      "moment": "^2.24.0",
 }
```

#### devDependencies

有一些包有可能你只是在开发环境中用到，例如你用于检测代码规范的 `eslint` ,用于进行测试的 `jest` ，用户使用你的包时即使不安装这些依赖也可以正常运行，反而安装他们会耗费更多的时间和资源，所以你可以把这些依赖添加到 `devDependencies` 中，这些依赖照样会在你本地进行 `npm install` 时被安装和管理，但是不会被安装到生产环境：

```json
 "devDependencies": {
      "jest": "^24.3.1",
      "eslint": "^6.1.0",
 }
```


#### peerDependencies

`peerDependencies` 用于指定你正在开发的模块所依赖的版本以及用户安装的依赖包版本的兼容性。

上面的说法可能有点太抽象，我们直接拿 `ant-design` 来举个例子，`ant-design` 的 `package.json` 中有如下配置：
```json
  "peerDependencies": {
    "react": ">=16.0.0",
    "react-dom": ">=16.0.0"
  }
```

当你正在开发一个系统，使用了 `ant-design` ，所以也肯定需要依赖 `React`。同时， `ant-design` 也是需要依赖 `React` 的，它要保持稳定运行所需要的 `React` 版本是`16.0.0`，而你开发时依赖的 `React` 版本是 `15.x`：


这时，`ant-design` 要使用 `React`，并将其引入：

```js
import * as React from 'react';
import * as ReactDOM from 'react-dom';
```

这时取到的是宿主环境也就是你的环境中的 `React` 版本，这就可能造成一些问题。在 `npm2` 的时候，指定上面的 `peerDependencies` 将意味着强制宿主环境安装 `react@>=16.0.0和react-dom@>=16.0.0` 的版本。

`npm3` 以后不会再要求 `peerDependencies` 所指定的依赖包被强制安装，相反 `npm3` 会在安装结束后检查本次安装是否正确，如果不正确会给用户打印警告提示。

```json
  "dependencies": {
    "react": "15.6.0",
    "antd": "^3.22.0"
  }
```

例如，我在项目中依赖了 `antd` 的最新版本，然后依赖了 `react` 的 `15.6.0`版本，在进行依赖安装时将给出以下警告：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191120205606.png)

#### optionalDependencies

某些场景下，依赖包可能不是强依赖的，这个依赖包的功能可有可无，当这个依赖包无法被获取到时，你希望 `npm install` 继续运行，而不会导致失败，你可以将这个依赖放到 `optionalDependencies` 中，注意 `optionalDependencies` 中的配置将会覆盖掉 `dependencies` 所以只需在一个地方进行配置。

当然，引用 `optionalDependencies` 中安装的依赖时，一定要做好异常处理，否则在模块获取不到时会导致报错。

#### bundledDependencies

和以上几个不同，`bundledDependencies` 的值是一个数组，数组里可以指定一些模块，这些模块将在这个包发布时被一起打包。

```json
  "bundledDependencies": ["package1" , "package2"]
```

### 1.4 协议

```json
{
    "license": "MIT"
}
```

`license` 字段用于指定软件的开源协议，开源协议里面详尽表述了其他人获得你代码后拥有的权利，可以对你的的代码进行何种操作，何种操作又是被禁止的。同一款协议有很多变种，协议太宽松会导致作者丧失对作品的很多权利，太严格又不便于使用者使用及作品的传播，所以开源作者要考虑自己对作品想保留哪些权利，放开哪些限制。

> 软件协议可分为开源和商业两类，对于商业协议，或者叫法律声明、许可协议，每个软件会有自己的一套行文，由软件作者或专门律师撰写，对于大多数人来说不必自己花时间和精力去写繁长的许可协议，选择一份广为流传的开源协议就是个不错的选择。

以下就是几种主流的开源协议：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191128221217.png)

- `MIT`：只要用户在项目副本中包含了版权声明和许可声明，他们就可以拿你的代码做任何想做的事情，你也无需承担任何责任。
- `Apache`：类似于 `MIT`，同时还包含了贡献者向用户提供专利授权相关的条款。
- `GPL`：修改项目代码的用户再次分发源码或二进制代码时，必须公布他的相关修改。

如果你对开源协议有更详细的要求，可以到 https://choosealicense.com/ 获取更详细的开源协议说明。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191128201149.png)


### 1.5 目录、文件相关

#### 程序入口

```json
{
  "main": "lib/index.js",
}
```

`main` 属性可以指定程序的主入口文件，例如，上面 `antd` 指定的模块入口 `lib/index.js` ，当我们在代码用引入 `antd` 时：`import { notification } from 'antd';` 实际上引入的就是 `lib/index.js` 中暴露出去的模块。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191122213941.png)

#### 命令行工具入口

当你的模块是一个命令行工具时，你需要为命令行工具指定一个入口，即指定你的命令名称和本地可指定文件的对应关系。如果是全局安装，npm 将会使用符号链接把可执行文件链接到 `/usr/local/bin`，如果是本地安装，会链接到 `./node_modules/.bin/`。

```json
{
    "bin": {
    "conard": "./bin/index.js"
  }
}
```

例如上面的配置：当你的包安装到全局时：`npm` 会在 `/usr/local/bin `下创建一个以 `conard` 为名字的软链接，指向全局安装下来的 `conard` 包下面的 `"./bin/index.js"`。这时你在命令行执行 `conard` 则会调用链接到的这个js文件。

> 这里不再过多展开，更多内容在我后续的命令行工具文章中会进行详细讲解。

#### 发布文件配置

```json
{
    "files": [
      "dist",
      "lib",
      "es"
    ]
}
```

`files` 属性用于描述你 `npm publish` 后推送到 `npm` 服务器的文件列表，如果指定文件夹，则文件夹内的所有内容都会包含进来。我们可以看到下载后的包是下面的目录结构：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191122215525.png)

> 另外，你还可以通过配置一个 `.npmignore` 文件来排除一些文件, 防止大量的垃圾文件推送到 `npm`, 规则上和你用的 `.gitignore` 是一样的。`.gitignore` 文件也可以充当`.npmignore` 文件。

#### man

`man` 命令是 `Linux` 下的帮助指令，通过 `man` 指令可以查看 `Linux` 中的指令帮助、配置文件帮助和编程帮助等信息。

如果你的 `node.js` 模块是一个全局的命令行工具，在 `package.json` 通过 `man`  属性可以指定 `man` 命令查找的文档地址。

`man` 文件必须以数字结尾，或者如果被压缩了，以 `.gz` 结尾。数字表示文件将被安装到 `man` 的哪个部分。如果 `man` 文件名称不是以模块名称开头的，安装的时候会给加上模块名称前缀。

例如下面这段配置：

```json
{ 
  "man" : [ 
    "/Users/isaacs/dev/npm/cli/man/man1/npm-access.1",
    "/Users/isaacs/dev/npm/cli/man/man1/npm-audit.1"
  ]
}
```

在命令行输入 `man npm-audit` ：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191124161049.png)


#### 规范项目目录

一个 `node.js` 模块是基于 `CommonJS` 模块化规范实现的，严格按照 `CommonJS` 规范，模块目录下除了必须包含包描述文件 `package.json` 以外，还需要包含以下目录：

- `bin`：存放可执行二进制文件的目录
- `lib`：存放js代码的目录
- `doc`：存放文档的目录
- `test`：存放单元测试用例代码的目录
- ...

在模块目录中你可能没有严格按照以上结构组织或命名，你可以通过在 `package.json` 指定 `directories` 属性来指定你的目录结构和上述的规范结构的对应情况。除此之外 `directories` 属性暂时没有其他应用。

```js
{
  "directories": {
    "lib": "src/lib/",
    "bin": "src/bin/",
    "man": "src/man/",
    "doc": "src/doc/",
    "example": "src/example/"
  }
}
```

> 不过官方文档表示，虽然目前这个属性没有什么重要作用，未来可能会整出一些花样出来，例如：doc 中存放的 markdown 文件、example 中存放的示例文件，可能会友好的展示出来。



### 1.6 脚本配置 

#### script

```json
{
  "scripts": {
    "test": "jest --config .jest.js --no-cache",
    "dist": "antd-tools run dist",
    "compile": "antd-tools run compile",
    "build": "npm run compile && npm run dist"
  }
}
```

`scripts` 用于配置一些脚本命令的缩写，各个脚本可以互相组合使用，这些脚本可以覆盖整个项目的生命周期，配置后可使用 `npm run command` 进行调用。如果是 `npm` 关键字，则可以直接调用。例如，上面的配置制定了以下几个命令：`npm run test`、`npm run dist`、`npm run compile`、`npm run build`。

#### config

`config` 字段用于配置脚本中使用的环境变量，例如下面的配置，可以在脚本中使用`process.env.npm_package_config_port`进行获取。

```json
{
  "config" : { "port" : "8080" }
}
```

### 1.7 发布配置

#### preferGlobal

如果你的 `node.js` 模块主要用于安装到全局的命令行工具，那么该值设置为 `true` ，当用户将该模块安装到本地时，将得到一个警告。这个配置并不会阻止用户安装，而是会提示用户防止错误使用而引发一些问题。

#### private

如果将 `private` 属性设置为 `true`，npm将拒绝发布它，这是为了防止一个私有模块被无意间发布出去。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191124164932.png)


#### publishConfig

```json
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
```

发布模块时更详细的配置，例如你可以配置只发布某个 `tag`、配置发布到的私有 `npm` 源。更详细的配置可以参考 [npm-config](http://caibaojian.com/npm/misc/config.html) 

#### os

假如你开发了一个模块，只能跑在 `darwin` 系统下，你需要保证 `windows` 用户不会安装到你的模块，从而避免发生不必要的错误。

使用 `os` 属性可以帮助你完成以上的需求，你可以指定你的模块只能被安装在某些系统下，或者指定一个不能安装的系统黑名单：

```json
"os" : [ "darwin", "linux" ]
"os" : [ "!win32" ]
```

例如，我把一个测试模块指定一个系统黑名单：`"os" : [ "!darwin" ]`，当我在此系统下安装它时会爆出如下错误：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191128201818.png)

> 在node环境下可以使用 process.platform 来判断操作系统。

#### cpu

和上面的 `os` 类似，我们可以用 `cpu` 属性更精准的限制用户安装环境：

```json
"cpu" : [ "x64", "ia32" ]
"cpu" : [ "!arm", "!mips" ]
```

> 在node环境下可以使用 process.arch 来判断 cpu 架构。


## 二、剖析包版本管理机制

`Nodejs`成功离不开 `npm` 优秀的依赖管理系统。在介绍整个依赖系统之前，必须要了解 `npm`如何管理依赖包的版本，本章将介绍 `npm包` 的版本发布规范、如何管理各种依赖包的版本以及一些关于包版本的最佳实践。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191104120006.png)

### 2.1 查看npm包版本

你可以执行 `npm view package version` 查看某个 `package` 的最新版本。

执行 `npm view conard versions` 查看某个 `package` 在npm服务器上所有发布过的版本。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191102180031.png)


执行 `npm ls` 可查看当前仓库依赖树上所有包的版本信息。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191103204351.png)

### 2.2 SemVer规范

`npm包` 中的模块版本都需要遵循 `SemVer`规范——由 `Github` 起草的一个具有指导意义的，统一的版本号表示规则。实际上就是 `Semantic Version`（语义化版本）的缩写。

> SemVer规范官网： https://semver.org/

#### 标准版本

`SemVer`规范的标准版本号采用 `X.Y.Z` 的格式，其中 X、Y 和 Z 为非负的整数，且禁止在数字前方补零。X 是主版本号、Y 是次版本号、而 Z 为修订号。每个元素必须以数值来递增。

- 主版本号(`major`)：当你做了不兼容的API 修改
- 次版本号(`minor`)：当你做了向下兼容的功能性新增
- 修订号(`patch`)：当你做了向下兼容的问题修正。 

例如：`1.9.1 -> 1.10.0 -> 1.11.0`

#### 先行版本

当某个版本改动比较大、并非稳定而且可能无法满足预期的兼容性需求时，你可能要先发布一个先行版本。

先行版本号可以加到“主版本号.次版本号.修订号”的后面，先加上一个连接号再加上一连串以句点分隔的标识符和版本编译信息。

- 内部版本(`alpha`): 
- 公测版本(`beta`): 
- 正式版本的候选版本`rc`: 即 `Release candiate`


#### React的版本

下面我们来看看 `React` 的历史版本：


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/reactversion.gif)

可见是严格按照 `SemVer` 规范来发版的：

- 版本号严格按照 `主版本号.次版本号.修订号` 格式命名
- 版本是严格递增的，：`16.8.0 -> 16.8.1 -> 16.8.2`
- 发布重大版本或版本改动较大时，先发布`alpha`、`beta`、`rc`等先行版本

#### 发布版本

在修改 `npm` 包某些功能后通常需要发布一个新的版本，我们通常的做法是直接去修改 `package.json` 到指定版本。如果操作失误，很容易造成版本号混乱，我们可以借助符合 `Semver` 规范的命令来完成这一操作：

- `npm version patch` : 升级修订版本号
- `npm version minor` : 升级次版本号
- `npm version major` : 升级主版本号

### 2.3 版本工具使用 

在开发中肯定少不了对一些版本号的操作，如果这些版本号符合 `SemVer`规范 ，我们可以借助用于操作版本的npm包`semver`来帮助我们进行比较版本大小、提取版本信息等操作。

> Npm 也使用了该工具来处理版本相关的工作。

```js
npm install semver
```

- 比较版本号大小
```js
semver.gt('1.2.3', '9.8.7') // false
semver.lt('1.2.3', '9.8.7') // true
```

- 判断版本号是否符合规范，返回解析后符合规范的版本号。

```js
semver.valid('1.2.3') // '1.2.3'
semver.valid('a.b.c') // null
```

- 将其他版本号强制转换成semver版本号

```js
semver.valid(semver.coerce('v2')) // '2.0.0'
semver.valid(semver.coerce('42.6.7.9.3-alpha')) // '42.6.7'
```

- 一些其他用法

```js
semver.clean('  =v1.2.3   ') // '1.2.3'
semver.satisfies('1.2.3', '1.x || >=2.5.0 || 5.0.0 - 7.2.3') // true
semver.minVersion('>=1.0.0') // '1.0.0'
```

以上都是semver最常见的用法，更多详细内容可以查看 semver文档：https://github.com/npm/node-semver

### 2.4 依赖版本管理

我们经常看到，在 `package.json` 中各种依赖的不同写法：

```json
  "dependencies": {
    "signale": "1.4.0",
    "figlet": "*",
    "react": "16.x",
    "table": "~5.4.6",
    "yargs": "^14.0.0"
  }
```

前面三个很容易理解：

- `"signale": "1.4.0"`: 固定版本号
- `"figlet": "*"`: 任意版本（`>=0.0.0`）
- `"react": "16.x"`: 匹配主要版本（`>=16.0.0 <17.0.0`）
- `"react": "16.3.x"`: 匹配主要版本和次要版本（`>=16.3.0 <16.4.0`）

再来看看后面两个，版本号中引用了 `~` 和 `^` 符号：

- `~`: 当安装依赖时获取到有新版本时，安装到 `x.y.z` 中 `z` 的最新的版本。即保持主版本号、次版本号不变的情况下，保持修订号的最新版本。
- `^`: 当安装依赖时获取到有新版本时，安装到 `x.y.z` 中 `y` 和 `z` 都为最新版本。 即保持主版本号不变的情况下，保持次版本号、修订版本号为最新版本。

在 `package.json` 文件中最常见的应该是 `"yargs": "^14.0.0"` 这种格式的 依赖, 因为我们在使用 `npm install package` 安装包时，`npm` 默认安装当前最新版本，然后在所安装的版本号前加 `^` 号。

注意，当主版本号为 `0` 的情况，会被认为是一个不稳定版本，情况与上面不同：

- 主版本号和次版本号都为 `0`: `^0.0.z`、`~0.0.z` 都被当作固定版本，安装依赖时均不会发生变化。
- 主版本号为 `0`: `^0.y.z` 表现和 `~0.y.z` 相同，只保持修订号为最新版本。

> 1.0.0 的版本号用于界定公共 API。当你的软件发布到了正式环境，或者有稳定的API时，就可以发布1.0.0版本了。所以，当你决定对外部发布一个正式版本的npm包时，把它的版本标为1.0.0。


### 2.5 锁定依赖版本

#### lock文件

实际开发中，经常会因为各种依赖不一致而产生奇怪的问题，或者在某些场景下，我们不希望依赖被更新，建议在开发中使用 `package-lock.json`。

锁定依赖版本意味着在我们不手动执行更新的情况下，每次安装依赖都会安装固定版本。保证整个团队使用版本号一致的依赖。

每次安装固定版本，无需计算依赖版本范围，大部分场景下能大大加速依赖安装时间。

> 使用 package-lock.json 要确保npm的版本在5.6以上，因为在5.0 - 5.6中间，对 package-lock.json的处理逻辑进行过几次更新，5.6版本后处理逻辑逐渐稳定。

关于 `package-lock.json` 详细的结构，我们会在后面的章节进行解析。

#### 定期更新依赖

我们的目的是保证团队中使用的依赖一致或者稳定，而不是永远不去更新这些依赖。实际开发场景下，我们虽然不需要每次都去安装新的版本，仍然需要定时去升级依赖版本，来让我们享受依赖包升级带来的问题修复、性能提升、新特性更新。

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191103214620.png)


使用 `npm outdated` 可以帮助我们列出有哪些还没有升级到最新版本的依赖：

- 黄色表示不符合我们指定的语意化版本范围 - 不需要升级
- 红色表示符合指定的语意化版本范围 - 需要升级

执行 `npm update` 会升级所有的红色依赖。

### 2.6 依赖版本选择的最佳实践

#### 版本发布

- 对外部发布一个正式版本的npm包时，把它的版本标为`1.0.0`。
- 某个包版本发行后，任何修改都必须以新版本发行。
- 版本号严格按照 `主版本号.次版本号.修订号` 格式命名
- 版本号发布必须是严格递增的
- 发布重大版本或版本改动较大时，先发布`alpha、beta、rc`等先行版本

#### 依赖范围选择

- 主工程依赖了很多子模块，都是团队成员开发的`npm`包，此时建议把版本前缀改为`~`，如果锁定的话每次子依赖更新都要对主工程的依赖进行升级，非常繁琐，如果对子依赖完全信任，直接开启`^`每次升级到最新版本。
- 主工程跑在`docker`线上，本地还在进行子依赖开发和升级，在`docker`版本发布前要锁定所有依赖版本，确保本地子依赖发布后线上不会出问题。

#### 保持依赖一致

- 确保`npm`的版本在`5.6`以上，确保默认开启 `package-lock.json` 文件。
- 由初始化成员执行 `npm inatall` 后，将 `package-lock.json` 提交到远程仓库。不要直接提交 `node_modules`到远程仓库。
- 定期执行 `npm update` 升级依赖，并提交 `lock` 文件确保其他成员同步更新依赖，不要手动更改 `lock` 文件。

#### 依赖变更

- 升级依赖: 修改 `package.json`文件的依赖版本，执行 `npm install`
- 降级依赖: 直接执行 `npm install package@version`(改动`package.json`不会对依赖进行降级)
- 注意改动依赖后提交`lock`文件


## 三、剖析 npm install 原理

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191216204254.png)

`npm install` 大概会经过上面的几个流程，这一章就来讲一讲各个流程的实现细节、发展以及为何要这样实现。

### 3.1 嵌套结构

我们都知道，执行 `npm install` 后，依赖包被安装到了 `node_modules` ，下面我们来具体了解下，`npm` 将依赖包安装到 `node_modules` 的具体机制是什么。

在 `npm` 的早期版本， `npm` 处理依赖的方式简单粗暴，以递归的形式，严格按照 `package.json` 结构以及子依赖包的 `package.json` 结构将依赖安装到他们各自的 `node_modules` 中。直到有子依赖包不在依赖其他模块。

举个例子，我们的模块 `my-app` 现在依赖了两个模块：`buffer`、`ignore`：

```json
{
  "name": "my-app",
  "dependencies": {
    "buffer": "^5.4.3",
    "ignore": "^5.1.4",
  }
}
```

`ignore`是一个纯 `JS` 模块，不依赖任何其他模块，而 `buffer` 又依赖了下面两个模块：`base64-js` 、 `ieee754`。

```json
{
  "name": "buffer",
  "dependencies": {
    "base64-js": "^1.0.2",
    "ieee754": "^1.1.4"
  }
}
```

那么，执行 `npm install` 后，得到的 `node_modules` 中模块目录结构就是下面这样的：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191205212006.png)

这样的方式优点很明显， `node_modules` 的结构和 `package.json` 结构一一对应，层级结构明显，并且保证了每次安装目录结构都是相同的。

但是，试想一下，如果你依赖的模块非常之多，你的 `node_modules` 将非常庞大，嵌套层级非常之深：


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191209204445.png)

- 在不同层级的依赖中，可能引用了同一个模块，导致大量冗余。
- 在 `Windows` 系统中，文件路径最大长度为260个字符，嵌套层级过深可能导致不可预知的问题。

### 3.2 扁平结构

为了解决以上问题，`NPM` 在 `3.x` 版本做了一次较大更新。其将早期的嵌套结构改为扁平结构：

- 安装模块时，不管其是直接依赖还是子依赖的依赖，优先将其安装在 `node_modules` 根目录。

还是上面的依赖结构，我们在执行 `npm install` 后将得到下面的目录结构：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191205213530.png)


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191205212301.png)


此时我们若在模块中又依赖了 `base64-js@1.0.1` 版本：


```json
{
  "name": "my-app",
  "dependencies": {
    "buffer": "^5.4.3",
    "ignore": "^5.1.4",
    "base64-js": "1.0.1",
  }
}
```


- 当安装到相同模块时，判断已安装的模块版本是否符合新模块的版本范围，如果符合则跳过，不符合则在当前模块的 `node_modules` 下安装该模块。

此时，我们在执行 `npm install` 后将得到下面的目录结构：


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191205213424.png)

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191205212637.png)


对应的，如果我们在项目代码中引用了一个模块，模块查找流程如下：

- 在当前模块路径下搜索
- 在当前模块 `node_modules` 路径下搜素
- 在上级模块的 `node_modules` 路径下搜索
- ...
- 直到搜索到全局路径中的 `node_modules` 

假设我们又依赖了一个包 `buffer2@^5.4.3`，而它依赖了包 `base64-js@1.0.3`，则此时的安装结构是下面这样的：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191215180332.png)

所以 `npm 3.x` 版本并未完全解决老版本的模块冗余问题，甚至还会带来新的问题。

试想一下，你的APP假设没有依赖 `base64-js@1.0.1` 版本，而你同时依赖了依赖不同 `base64-js` 版本的 `buffer` 和 `buffer2`。由于在执行 `npm install` 的时候，按照 `package.json` 里依赖的顺序依次解析，则 `buffer` 和 `buffer2` 在  `package.json` 的放置顺序则决定了 `node_modules` 的依赖结构：

先依赖`buffer2`：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191215180551.png)

先依赖`buffer`：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191215180415.png)

另外，为了让开发者在安全的前提下使用最新的依赖包，我们在 `package.json` 通常只会锁定大版本，这意味着在某些依赖包小版本更新后，同样可能造成依赖结构的改动，依赖结构的不确定性可能会给程序带来不可预知的问题。

### 3.3 Lock文件

为了解决 `npm install` 的不确定性问题，在 `npm 5.x` 版本新增了 `package-lock.json` 文件，而安装方式还沿用了 `npm 3.x` 的扁平化的方式。 

 `package-lock.json` 的作用是锁定依赖结构，即只要你目录下有 `package-lock.json` 文件，那么你每次执行 `npm install` 后生成的 `node_modules` 目录结构一定是完全相同的。

例如，我们有如下的依赖结构：


```json
{
  "name": "my-app",
  "dependencies": {
    "buffer": "^5.4.3",
    "ignore": "^5.1.4",
    "base64-js": "1.0.1",
  }
}
```

在执行 `npm install` 后生成的 `package-lock.json` 如下：

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "base64-js": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.0.1.tgz",
      "integrity": "sha1-aSbRsZT7xze47tUTdW3i/Np+pAg="
    },
    "buffer": {
      "version": "5.4.3",
      "resolved": "https://registry.npmjs.org/buffer/-/buffer-5.4.3.tgz",
      "integrity": "sha512-zvj65TkFeIt3i6aj5bIvJDzjjQQGs4o/sNoezg1F1kYap9Nu2jcUdpwzRSJTHMMzG0H7bZkn4rNQpImhuxWX2A==",
      "requires": {
        "base64-js": "^1.0.2",
        "ieee754": "^1.1.4"
      },
      "dependencies": {
        "base64-js": {
          "version": "1.3.1",
          "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.3.1.tgz",
          "integrity": "sha512-mLQ4i2QO1ytvGWFWmcngKO//JXAQueZvwEKtjgQFM4jIK0kU+ytMfplL8j+n5mspOfjHwoAg+9yhb7BwAHm36g=="
        }
      }
    },
    "ieee754": {
      "version": "1.1.13",
      "resolved": "https://registry.npmjs.org/ieee754/-/ieee754-1.1.13.tgz",
      "integrity": "sha512-4vf7I2LYV/HaWerSo3XmlMkp5eZ83i+/CDluXi/IGTs/O1sejBNhTtnxzmRZfvOUqj7lZjqHkeTvpgSFDlWZTg=="
    },
    "ignore": {
      "version": "5.1.4",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.1.4.tgz",
      "integrity": "sha512-MzbUSahkTW1u7JpKKjY7LCARd1fU5W2rLdxlM4kdkayuCwZImjkpluF9CM1aLewYJguPDqewLam18Y6AU69A8A=="
    }
  }
}
```

我们来具体看看上面的结构：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191212205453.png)

最外面的两个属性 `name` 、`version` 同 `package.json` 中的 `name` 和 `version` ，用于描述当前包名称和版本。

`dependencies` 是一个对象，对象和 `node_modules` 中的包结构一一对应，对象的 `key` 为包名称，值为包的一些描述信息：

- `version`：包版本 —— 这个包当前安装在 `node_modules` 中的版本
- `resolved`：包具体的安装来源
- `integrity`：包 `hash` 值，基于 `Subresource Integrity` 来验证已安装的软件包是否被改动过、是否已失效
- `requires`：对应子依赖的依赖，与子依赖的 `package.json` 中 `dependencies`的依赖项相同。
- `dependencies`：结构和外层的 `dependencies` 结构相同，存储安装在子依赖 `node_modules` 中的依赖包。

这里注意，并不是所有的子依赖都有 `dependencies` 属性，只有子依赖的依赖和当前已安装在根目录的  `node_modules` 中的依赖冲突之后，才会有这个属性。

例如，回顾下上面的依赖关系：


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191205212637.png)

我们在 `my-app` 中依赖的 `base64-js@1.0.1` 版本与 `buffer` 中依赖的 `base64-js@^1.0.2` 发生冲突，所以  `base64-js@1.0.1`  需要安装在 `buffer` 包的 `node_modules` 中，对应了 `package-lock.json` 中 `buffer` 的 `dependencies` 属性。这也对应了 `npm` 对依赖的扁平化处理方式。

所以，根据上面的分析， `package-lock.json` 文件 和 `node_modules` 目录结构是一一对应的，即项目目录下存在  `package-lock.json` 可以让每次安装生成的依赖目录结构保持相同。

另外，项目中使用了 `package-lock.json` 可以显著加速依赖安装时间。

我们使用 `npm i  --timing=true  --loglevel=verbose` 命令可以看到 `npm install` 的完整过程，下面我们来对比下使用 `lock` 文件和不使用 `lock` 文件的差别。在对比前先清理下`npm` 缓存。

不使用 `lock` 文件：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/npmi1.gif)

使用 `lock` 文件：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/npmi2.gif)


可见， `package-lock.json` 中已经缓存了每个包的具体版本和下载链接，不需要再去远程仓库进行查询，然后直接进入文件完整性校验环节，减少了大量网络请求。

#### 使用建议

开发系统应用时，建议把 `package-lock.json` 文件提交到代码版本仓库，从而保证所有团队开发者以及 `CI` 环节可以在执行 `npm install` 时安装的依赖版本都是一致的。


在开发一个 `npm`包 时，你的 `npm`包 是需要被其他仓库依赖的，由于上面我们讲到的扁平安装机制，如果你锁定了依赖包版本，你的依赖包就不能和其他依赖包共享同一 `semver` 范围内的依赖包，这样会造成不必要的冗余。所以我们不应该把`package-lock.json` 文件发布出去（ `npm` 默认也不会把 `package-lock.json` 文件发布出去）。


### 3.4 缓存

在执行 `npm install` 或 `npm update`命令下载依赖后，除了将依赖包安装在`node_modules` 目录下外，还会在本地的缓存目录缓存一份。

通过 `npm config get cache` 命令可以查询到：在 `Linux` 或 `Mac` 默认是用户主目录下的 `.npm/_cacache` 目录。

在这个目录下又存在两个目录：`content-v2`、`index-v5`，`content-v2` 目录用于存储 `tar`包的缓存，而`index-v5`目录用于存储`tar`包的 `hash`。

npm 在执行安装时，可以根据 `package-lock.json` 中存储的 `integrity、version、name` 生成一个唯一的 `key` 对应到 `index-v5` 目录下的缓存记录，从而找到 `tar`包的 `hash`，然后根据 `hash` 再去找缓存的 `tar`包直接使用。

我们可以找一个包在缓存目录下搜索测试一下，在 `index-v5` 搜索一下包路径：

```js
grep "https://registry.npmjs.org/base64-js/-/base64-js-1.0.1.tgz" -r index-v5
```
![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191212215209.png)

然后我们将json格式化：

```json
{
  "key": "pacote:version-manifest:https://registry.npmjs.org/base64-js/-/base64-js-1.0.1.tgz:sha1-aSbRsZT7xze47tUTdW3i/Np+pAg=",
  "integrity": "sha512-C2EkHXwXvLsbrucJTRS3xFHv7Mf/y9klmKDxPTE8yevCoH5h8Ae69Y+/lP+ahpW91crnzgO78elOk2E6APJfIQ==",
  "time": 1575554308857,
  "size": 1,
  "metadata": {
    "id": "base64-js@1.0.1",
    "manifest": {
      "name": "base64-js",
      "version": "1.0.1",
      "engines": {
        "node": ">= 0.4"
      },
      "dependencies": {},
      "optionalDependencies": {},
      "devDependencies": {
        "standard": "^5.2.2",
        "tape": "4.x"
      },
      "bundleDependencies": false,
      "peerDependencies": {},
      "deprecated": false,
      "_resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.0.1.tgz",
      "_integrity": "sha1-aSbRsZT7xze47tUTdW3i/Np+pAg=",
      "_shasum": "6926d1b194fbc737b8eed513756de2fcda7ea408",
      "_shrinkwrap": null,
      "bin": null,
      "_id": "base64-js@1.0.1"
    },
    "type": "finalized-manifest"
  }
}
```

上面的 `_shasum` 属性 `6926d1b194fbc737b8eed513756de2fcda7ea408` 即为 `tar` 包的 `hash`， `hash`的前几位 `6926` 即为缓存的前两层目录，我们进去这个目录果然找到的压缩后的依赖包：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191212220114.png)

> 以上的缓存策略是从 npm v5 版本开始的，在 npm v5 版本之前，每个缓存的模块在 ~/.npm 文件夹中以模块名的形式直接存储，储存结构是{cache}/{name}/{version}。

`npm` 提供了几个命令来管理缓存数据：

- `npm cache add`：官方解释说这个命令主要是 `npm` 内部使用，但是也可以用来手动给一个指定的 package 添加缓存。
- `npm cache clean`：删除缓存目录下的所有数据，为了保证缓存数据的完整性，需要加上 `--force` 参数。
- `npm cache verify`：验证缓存数据的有效性和完整性，清理垃圾数据。

基于缓存数据，npm 提供了离线安装模式，分别有以下几种：

- `--prefer-offline`： 优先使用缓存数据，如果没有匹配的缓存数据，则从远程仓库下载。
- `--prefer-online`： 优先使用网络数据，如果网络数据请求失败，再去请求缓存数据，这种模式可以及时获取最新的模块。
- `--offline`： 不请求网络，直接使用缓存数据，一旦缓存数据不存在，则安装失败。


### 3.5 文件完整性

上面我们多次提到了文件完整性，那么什么是文件完整性校验呢？

在下载依赖包之前，我们一般就能拿到 `npm` 对该依赖包计算的 `hash` 值，例如我们执行 `npm info` 命令，紧跟 `tarball`(下载链接) 的就是 `shasum`(`hash`) ：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191212220916.png)

用户下载依赖包到本地后，需要确定在下载过程中没有出现错误，所以在下载完成之后需要在本地在计算一次文件的 `hash` 值，如果两个 `hash` 值是相同的，则确保下载的依赖是完整的，如果不同，则进行重新下载。



### 3.6 整体流程

好了，我们再来整体总结下上面的流程：

- 检查 `.npmrc` 文件：优先级为：项目级的 `.npmrc` 文件 > 用户级的 `.npmrc` 文件> 全局级的 `.npmrc` 文件 > npm 内置的 `.npmrc` 文件
- 检查项目中有无 `lock` 文件。

- 无 `lock` 文件：
  - 从 `npm` 远程仓库获取包信息
  - 根据 `package.json` 构建依赖树，构建过程：
    - 构建依赖树时，不管其是直接依赖还是子依赖的依赖，优先将其放置在 `node_modules` 根目录。
    - 当遇到相同模块时，判断已放置在依赖树的模块版本是否符合新模块的版本范围，如果符合则跳过，不符合则在当前模块的 `node_modules` 下放置该模块。
    - 注意这一步只是确定逻辑上的依赖树，并非真正的安装，后面会根据这个依赖结构去下载或拿到缓存中的依赖包
  - 在缓存中依次查找依赖树中的每个包
    - 不存在缓存：
      - 从 `npm` 远程仓库下载包
      - 校验包的完整性
      - 校验不通过：
        - 重新下载
      - 校验通过：
        - 将下载的包复制到 `npm` 缓存目录
        - 将下载的包按照依赖结构解压到 `node_modules` 
    - 存在缓存：将缓存按照依赖结构解压到 `node_modules` 
  - 将包解压到 `node_modules`
  - 生成 `lock` 文件

- 有 `lock` 文件： 
  - 检查 `package.json` 中的依赖版本是否和 `package-lock.json` 中的依赖有冲突。
  - 如果没有冲突，直接跳过获取包信息、构建依赖树过程，开始在缓存中查找包信息，后续过程相同

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191216204254.png)

上面的过程简要描述了 `npm install` 的大概过程，这个过程还包含了一些其他的操作，例如执行你定义的一些生命周期函数，你可以执行 `npm install package --timing=true --loglevel=verbose` 来查看某个包具体的安装流程和细节。

### 3.7 yarn

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191212211827.png)

`yarn` 是在 `2016` 年发布的，那时 `npm` 还处于 `V3` 时期，那时候还没有 `package-lock.json` 文件，就像上面我们提到的：不稳定性、安装速度慢等缺点经常会受到广大开发者吐槽。此时，`yarn` 诞生：


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191212211752.png)

上面是官网提到的 `yarn` 的优点，在那个时候还是非常吸引人的。当然，后来 `npm` 也意识到了自己的问题，进行了很多次优化，在后面的优化（`lock`文件、缓存、默认-s...）中，我们多多少少能看到 `yarn` 的影子，可见 `yarn` 的设计还是非常优秀的。

 `yarn` 也是采用的是 `npm v3` 的扁平结构来管理依赖，安装依赖后默认会生成一个 `yarn.lock` 文件，还是上面的依赖关系，我们看看 `yarn.lock` 的结构：

```
# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


base64-js@1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/base64-js/-/base64-js-1.0.1.tgz#6926d1b194fbc737b8eed513756de2fcda7ea408"
  integrity sha1-aSbRsZT7xze47tUTdW3i/Np+pAg=

base64-js@^1.0.2:
  version "1.3.1"
  resolved "https://registry.yarnpkg.com/base64-js/-/base64-js-1.3.1.tgz#58ece8cb75dd07e71ed08c736abc5fac4dbf8df1"
  integrity sha512-mLQ4i2QO1ytvGWFWmcngKO//JXAQueZvwEKtjgQFM4jIK0kU+ytMfplL8j+n5mspOfjHwoAg+9yhb7BwAHm36g==

buffer@^5.4.3:
  version "5.4.3"
  resolved "https://registry.yarnpkg.com/buffer/-/buffer-5.4.3.tgz#3fbc9c69eb713d323e3fc1a895eee0710c072115"
  integrity sha512-zvj65TkFeIt3i6aj5bIvJDzjjQQGs4o/sNoezg1F1kYap9Nu2jcUdpwzRSJTHMMzG0H7bZkn4rNQpImhuxWX2A==
  dependencies:
    base64-js "^1.0.2"
    ieee754 "^1.1.4"

ieee754@^1.1.4:
  version "1.1.13"
  resolved "https://registry.yarnpkg.com/ieee754/-/ieee754-1.1.13.tgz#ec168558e95aa181fd87d37f55c32bbcb6708b84"
  integrity sha512-4vf7I2LYV/HaWerSo3XmlMkp5eZ83i+/CDluXi/IGTs/O1sejBNhTtnxzmRZfvOUqj7lZjqHkeTvpgSFDlWZTg==

ignore@^5.1.4:
  version "5.1.4"
  resolved "https://registry.yarnpkg.com/ignore/-/ignore-5.1.4.tgz#84b7b3dbe64552b6ef0eca99f6743dbec6d97adf"
  integrity sha512-MzbUSahkTW1u7JpKKjY7LCARd1fU5W2rLdxlM4kdkayuCwZImjkpluF9CM1aLewYJguPDqewLam18Y6AU69A8A==

```

可见其和 `package-lock.json` 文件还是比较类似的，还有一些区别就是：

- `package-lock.json` 使用的是 `json` 格式，`yarn.lock` 使用的是一种自定义格式
- `yarn.lock` 中子依赖的版本号不是固定的，意味着单独又一个 `yarn.lock` 确定不了 `node_modules` 目录结构，还需要和 `package.json` 文件进行配合。而 `package-lock.json` 只需要一个文件即可确定。


`yarn` 的缓策略看起来和 `npm v5` 之前的很像，每个缓存的模块被存放在独立的文件夹，文件夹名称包含了模块名称、版本号等信息。使用命令 `yarn cache dir` 可以查看缓存数据的目录：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191215184320.png)

> `yarn` 默认使用 `prefer-online` 模式，即优先使用网络数据，如果网络数据请求失败，再去请求缓存数据。


## 参考

- https://juejin.im/post/5a6008c2f265da3e5033cd93
- https://www.zhihu.com/question/305539244/answer/551386426
- https://zhuanlan.zhihu.com/p/37285173
- https://semver.org/lang/zh-CN/
- http://deadhorse.me/nodejs/2014/04/27/semver-in-nodejs.html
- http://caibaojian.com/npm/files/package.json.html


## 小结

希望阅读完本篇文章能对你有如下帮助：

- 了解 `pacakge.json` 中的各项详细配置从而对项目工程化配置有更进一步的见解
- 掌握 `npm` 的版本管理机制，能合理配置依赖版本
- 理解 `npm install` 安装原理，能合理运用 `npm`缓存、`package-lock.json`

文中如有错误，欢迎在评论区指正，如果这篇文章帮助到了你，欢迎点赞和关注。

想阅读更多优质文章、可关注我的[github博客](https://github.com/ConardLi/ConardLi.github.io)，你的star✨、点赞和关注是我持续创作的动力！

推荐关注我的微信公众号【code秘密花园】，每天推送高质量文章，我们一起交流成长。