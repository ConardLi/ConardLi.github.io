---
title: 前端安全—你必须要注意的依赖安全漏洞
category: Web安全
tag: 
- Web安全
- 依赖管理
date: 2020-01-14
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


## 从一个安全漏洞说起

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e20fe60ac2f~tplv-t2oaga2asx-image.image)


`Lodash` 是一款非常流行的 `npm` 库，每月的下载量超过 `8000` 万次，`GitHub` 上使用它的项目有超过 `400` 万。前段时间 `Lodash` 的一个安全漏洞刷爆了朋友圈，我们先来回忆下这个安全漏洞：

攻击者可以通过 `Lodash` 的一些函数覆盖或污染应用程序。例如：通过 `Lodash` 库中的函数 `defaultsDeep` 可以修改 `Object.prototype` 的属性。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e20fe7cbc8a~tplv-t2oaga2asx-image.image)

我们都知道，`JavaScript` 在读取对象中的某个属性时，如果查找不到就会去其原型链上查找。试想一下，如果被修改的属性是 `toString` 方法：


```js
const payload = '{"constructor": {"prototype": {"toString": true}}}'
_.defaultsDeep({}, JSON.parse(payload))
```

每个对象都有一个 `toString()` 方法，当该对象被表示为一个文本值时，或者一个对象以预期的字符串方式引用时自动调用。默认情况下，`toString()` 方法被每个 `Object` 对象继承。如果此方法在自定义对象中未被覆盖，`toString()` 返回 `[object type]`，其中 `type` 是对象的类型。如果覆盖了 `toString()` 方法，那么给应用带来的影响就是非常大的。

其实上述的问题就属于一个很常见的安全漏洞 —— 原型污染

> 原型污染：攻击者通过某种手段修改 JavaScript 对象的原型（prototype）

然而这并不是 `Lodash` 第一次爆出安全漏洞了。事实上，像这样的安全漏洞还可能存在于我们使用的千千万万个不同的开源依赖中，如果我们平时不重视他们，一旦出现问题对我们的项目造成的损失是不可估计的。这相当于你的项目中埋着很多不知道什么时候就会爆炸的炸弹。

## 安全调查

其实开发人员对开源代码的安全性的信任程度要大于对自己编写的代码的安全性的信任程度，但是在确保代码安全性和质量的工具还有很多不足之处。在 `npm` 还没有一个完善的安全检测机制之前，`npm` 和 `NodeJs` 团队曾经对数万名 `JavaScript` 开发者发起过一个调查，第一个问题就是安全问题，具体就是开发人员如何看待他们编写的代码和所使用的开源项目的安全性。

调查结果显示：全球 `97％` 的 `JavaScript` 开发人员在自己开发的项目中都依赖开源代码，`77％` 的开发人员对他们使用的开源代码是否安全表示担忧。更有趣的是，有 `87％` 的人表示担心自己的代码的安全性。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e20fe833a1d~tplv-t2oaga2asx-image.image)

另外，超过一半的 `JavaScript` 开发人员认为，他们用来评估开源代码的安全性和质量的工具还不够好。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e20ffd1dd26~tplv-t2oaga2asx-image.image)

## npm audit

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e20fea6047a~tplv-t2oaga2asx-image.image)

基于上面的不太乐观的调查结果，`npm@6` 增加了一项重大更新：`npm audit` 命令。从上面的 `logo` 就可以看出，这个版本是主打安全性。 `npm audit` 命令会递归地分析依赖关系树以识别不安全的依赖，如果你在项目中使用了具有已知安全问题的依赖，就收到警告通知。该命令会在你更新或者安装了新的依赖包后自动运行。

`npm` 官方专门维护了一个漏洞列表，当开发者或者专业的安全团队发现某个依赖包存在安全问题后就会上报给 `npm` 官方，然后官方会通知该项目开发者进行修复，修复完成后 `npm` 会把漏洞详细的描述信息、解决方案发布出来：

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e21006f274a~tplv-t2oaga2asx-image.image)

`npm aduit` 主要做的就是把需要检查的依赖信息发送给一个官方检查接口, 该结构会在历史上报的漏洞数据库中判断当前依赖信息是否含有漏洞，然后生成一个包含包名称、漏洞严重性、简介、路径等的漏洞报告反馈给开发者。

我们现在直接安装一个具有安全漏洞的 `lodash@4.17.4` 版本，可见安装完成后会提醒你你刚刚增加的依赖中含有3个漏洞。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2126f712b8~tplv-t2oaga2asx-image.image)

执行 `npm audit` 我们可以看到漏洞详情，这个版本的 `lodash` 存在3个安全漏洞，我们来具体看一个：

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e21329194f3~tplv-t2oaga2asx-image.image)

- `High`: 表安全漏洞等级
- `Package`: 存在漏洞的包名称
- `Dependency of`: 当前工程直接依赖的包名称
- `Path`: 漏洞完整依赖路径
- `More info`: 漏洞详情

这里注意，并不只是直接依赖的包具有漏洞才会收到提醒，而是只要是你的依赖树中某一个节点依赖依赖了具有漏洞的包你就会收到提醒，来看看下面的例子：

项目中并非直接依赖了 `lodash` ，而是 `@commitlint/cli` 依赖的 `@commitlint/load` 中依赖了 `lodash` 就会算作一个漏洞，所以一些庞大的迭代周期很长的项目含有几万个安全漏洞也是很正常的。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2132995ea9~tplv-t2oaga2asx-image.image)

点开漏洞详情的链接：`https://www.npmjs.com/advisories/1065`

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2132c6c5d9~tplv-t2oaga2asx-image.image)

我们可以看到漏洞具体说明，以及解决方法，右侧是该漏洞的具体上报时间，漏洞公开时间。


## GitHub 安全板块

平时我们可能经常会收到类似如下的 `GitHub` 安全漏洞提醒的邮件。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2139014f0a~tplv-t2oaga2asx-image.image)

打开链接，我们可以看到漏洞具体的详情页面：

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2136224d76~tplv-t2oaga2asx-image.image)

`GitHub` 单独为它开辟了一个，`Security` 板块来展示 `GitHub` 检测到的依赖安全漏洞，可见这些漏洞是足够引起大家重视并且需要快速修复的：

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2156442a03~tplv-t2oaga2asx-image.image)

另外，`GitHub` 还为每个可修复的漏洞提供了一键修复的功能，点击 `Automated security updates` 按钮，`GitHub` 会自动将这些依赖漏洞修复，并提交一个 `Pull Request` 给你的仓库：

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e215d82fc5f~tplv-t2oaga2asx-image.image)

## 安全漏洞修复策略

`npm` 也提供了 `npm audit fix` 命令来帮助我们自动修复漏洞，还继续使用上面的例子， `Lodash` 在 `4.17.12` 版本之前都具有原型污染漏洞，下面我们来看看具体的修复策略：


### 直接依赖漏洞

当前我们直接依赖了一个具有安全漏洞的 `lodash@4.17.4` 版本：

```json
  "dependencies": {
    "lodash": "^4.17.4"
  }
```

由于 `^4.17.4` 的依赖范围是 `>=3.0.3 < 4.0.0`，已修复的版本 `4.17.12` 在这个范围内，那么实际上 `npm audit fix` 执行的逻辑就是 `npm update lodash@4.17.12`。

```
lodash@^4.17.4 -> lodash@^4.17.12
```

### 间接依赖漏洞


假设我们现在的依赖路径非常深： `@commitlint/cli^7.1.2>@commitlint/load^1.0.1>lodash^3.0.0`

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2132995ea9~tplv-t2oaga2asx-image.image)

因为 `@commitlint/load` 对 `lodash` 的依赖是`^3.0.0(>=3.0.0 <4.0.0)`，`4.17.12` 不在这个范围，所以我们不能直接通过升级 `Lodash` 来修复漏洞，这时我们就要向上层依赖进行分析。

假设此时 `@commitlint/load` 有一个更新版本 `@commitlint/load^1.0.2` 对 `lodash` 的依赖是`^4.0.0(>=4.0.0 <5.0.0)`，`lodash@4.17.12` 在这个依赖范围内，那么修复策略为 `npm update @commitlint/load@1.0.2 --depth=2`。

> npm update 只会检查更新顶层的依赖，更新更深层次的依赖版本需要使用 --depth 指定更新的深度。

按照这个逻辑，如果 `@commitlint/load` 也没有找到可以升级的包，那么再到上层依赖查找，直到找到可以修复漏洞的那个层级的依赖。

 
### 强制修复漏洞

按照上面的策略，从底层依赖一直向上层查找，如果一直到最上层依赖才有符合要求的修复版本，那么就直接 `npm update` 更新最顶层依赖。

继续使用上面的例子，如果 `@commitlint/cli^7.1.2( >=7.1.2 <8.0.0 )` 还不能找到一个可修复的版本，那么 `npm audit fix` 这个命令就无能为力了。

这时我们可以尝试 `npm audit fix --force`（强制执行 audit fix 安装最新的依赖项（toplevel））来进行修复，这个逻辑就是：`npm install @commitlint/cli@patchedVersion --save`

> 这个命令会直接跨越当前指定的 `semver` 版本范围，强制将依赖更新到最新版本，一定要谨慎使用。

npm 还提供了一些其他的修复命令命令

- `npm audit fix --package-lock-only`：在不修改 `node_modules` 的情况下执行 `audit fix`，仍然会更改 `pkglock`
- `npm audit fix --only=prod`：跳过更新 `devDependencies`

### 不可修复漏洞

当然，以上的修复策略都不能解决这个安全漏洞，那说明此漏洞是无法自动修复的，需要人工判定处理。


## 关闭安全检查

如果你对这些安全漏洞不 care，你也可以手动指定一些配置来关闭这些安全检查：

- 安装单个包关闭安全审查: `npm install example-package-name --no-audit`
- 安装所有包关闭安全审查 - 运行 `npm set audit false `
- 手动将 `~/.npmrc` 配置文件中的 `audit` 修改为 `false`

> 当然，强烈不推荐这么做，一定要对自己开发的项目负责到底～


## 解读依赖漏洞报告

执行 `npm audit --json` 将会打印出一个详细的 `json` 格式的安全报告，在这个报告里可以看到这些漏洞的详情，以及具体的漏洞修复策略。

由于这个 `JSON` 比较大，我就不直接贴在这里了，大家可以选择一个项目到本地执行 `npm audit --json` 查看。

### 漏洞数据总览

在 `metadata` 属性中：我们可以看到漏洞检查的数据总览：

```json
  {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 4,
      "high": 29,
      "critical": 0
    },
    "dependencies": 18594,
    "devDependencies": 891090,
    "optionalDependencies": 9514,
    "peerDependencies": 0,
    "totalDependencies": 909785
  }
```

`vulnerabilities` 中展示了每种等级漏洞的数量，`info`、`low`、`moderate`、`high`、`critical` 从左到右对应的安全漏洞等级从低到高。

下面是每种依赖的检测数量，就是我们熟悉的 `dependencies`、`devDependencies` 等等。

### 修复策略

在 `actions` 属性中，会列出所有可漏洞的修复策略，例如下面的，对 `@commitlint/load` 执行更新，深度为 `2` ，以修复 `@commitlint/cli>@commitlint/load>lodash` 这条路径上的漏洞：

```json
{
      "action": "update",
      "module": "@commitlint/load",
      "target": "1.0.2",
      "resolves": [
        {
          "id": 1184,
          "path": "@commitlint/cli>@commitlint/load>lodash",
          "dev": false,
          "optional": false,
          "bundled": false
        }
      ],
      "depth": 2
    }
```

另外，`action` 还有我们上面提到的其他几种操作：
- `install`(修复直接依赖)
- `install major`(强制升级依赖，跨越主版本)
- `review`(不可自动修复，需要人工review)

### 漏洞详情

`advisories` 属性存放了每个漏洞的详情：


```json
"1065": {
      "cves": [
        "CVE-2019-10744"
      ],
      "access": "public",
      "severity": "high",
      "metadata": "",
      "reviewers": "",
      "confirmors": "",
      "id": 1065,
      "repo_from": "npm",
      "title": "Prototype Pollution",
      "module_name": "lodash",
      "found_by_link": "",
      "found_by_user_name": "Snyk Security Team",
      "reported_by_link": "",
      "reported_by_user_name": "Snyk Security Team",
      "vulnerable_versions": "<4.17.12",
      "patched_versions": ">=4.17.12",
      "overview": "Versions of `lodash` before 4.17.12 are vulnerable to Prototype Pollution.  The function `defaultsDeep` allows a malicious user to modify the prototype of `Object` via `{constructor: {prototype: {...}}}` causing the addition or modification of an existing property that will exist on all objects.\n\n",
      "recommendation": "Update to version 4.17.12 or later.",
      "references": "- [Snyk Advisory](https://snyk.io/vuln/SNYK-JS-LODASH-450202)",
      "cwe": "CWE-471",
      "url": "https://npmjs.com/advisories/1065",
      "gmt_create": "2019-07-16T02:28:32.000Z",
      "gmt_modified": "2019-09-11T04:49:11.000Z",
      "deleted_at": null,
      "findings": [
        {
          "version": "4.17.11",
          "paths": [
            "@commitlint/cli>@commitlint/load>@commitlint/rules>@commitlint/ensure>lodash",
            "@commitlint/cli>@commitlint/load>lodash",
            "@commitlint/cli>@commitlint/load>@commitlint/resolve-extends>lodash",
            "@commitlint/cli>@commitlint/load>lodash",
            "@commitlint/cli>lodash"
          ],
          "dev": true,
          "optional": false,
          "bundled": false
        }
      ]
    }
```

由于属性比较多，我们挑几个重点的来看看：

- `cves`：CVE漏洞编号 
- `severity`：漏洞等级
- `found_by_user_name`：发现该漏洞的用户（这里 `Snyk Security Team` 是一个知名的安全团队）
- `vulnerable_versions`：受影响的版本
- `patched_versions`：已修复的版本
- `findings`：所有依赖此路径的漏洞
- `overview`：漏洞的简要说明，这里就提到了 `Lodash` 的 `defaultsDeep` 容易收到原型污染
- `references`：漏洞参考，一般是由某些专业安全平台发布的报告

## 安全平台

上面的报告中提到了几个专业的安全平台，容易让人产生迷惑，我们下面来具体看一下：



### HackerOne

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2160218875~tplv-t2oaga2asx-image.image)


`HackerOne（http://hackerone.com）`成立于 `2012` 年，是一个安全漏洞聚合和披露平台，黑客可以在网站上披露自己发现的安全漏洞、并报告给相关的网站或公司，这些网站或公司在确认后可以给黑客提供奖金等各类感谢。`HackerOne` 平台的注册黑客人数已突破 `30` 万人，提交的有效漏洞总计超过 `10` 万个，支付的漏洞奖励金超过 `4200` 万美元。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2167646411~tplv-t2oaga2asx-image.image)

```json
"references": "- [HackerOne Report](https://hackerone.com/reports/541502)"
```
我们可以在安全报告中看到，某些漏洞还会有一份 `HackerOne` 的漏洞报告做为参考。


### Snyk

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2167e8c137~tplv-t2oaga2asx-image.image)

`Snyk` 是用于多个开发堆栈的依赖关系分析平台，涵盖 `JavaScript，Java，.Net，Ruby，Python，PHP，Golang` 和 `Scala`。 `Snyk` 维护着一个全面的，开放源代码漏洞数据库，其中包括 `Snyk` 自己的专门研究团队发现的漏洞，以及从公共数据源跟踪的漏洞。

`Snyk` 的漏洞数据库通过其威胁情报系统提供有关漏洞的全面数据，提供更好的覆盖范围，并能够显示和报告尚未收到 `CVE` 的漏洞。例如，`npm` 提示的漏洞中有 `72％` 是先被添加到 `Snyk` 数据库里的。

`Snyk` 同样也提供了扫描安全漏洞的机制，相比 `npm audit`，它的优势是可以很容易和 `GitHub` 或 `GitLab` 的 `CI` 流程集成在一起，更多扫描机制上的对比，可以看看这篇文章：`https://www.nearform.com/blog/comparing-npm-audit-with-snyk/`。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e2177032030~tplv-t2oaga2asx-image.image)

```json
"references": "- [Snyk Advisory](https://snyk.io/vuln/SNYK-JS-LODASH-450202)"
```

我们可以在上面的安全报告中看到，某些漏洞还会有一份 `Snyk` 的漏洞报告做为参考，并且 `Lodash` 这个安全漏洞也是由 `Snyk` 安全团队发现并上报的。 

### CVE

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e218e2c7780~tplv-t2oaga2asx-image.image)

`CVE` 代表着通用漏洞和披露的标准, 这是一个由联邦政府赞助的研究和开发中心的非营利组织。它的目的是识别软件或固件中的漏洞并将其编目到一个免费的数据库中, 以提高组织的安全性。

用 `CVE ID` 标识特定漏洞或暴露, 组织可以快速准确地从各种 `CVE` 兼容的信息源中获取信息。通过在不同安全工具和服务之间的进行比对, `CVE` 可以帮助组织选择最适合其需要的内容。

```json
"cves": [
        "CVE-2019-10744"
      ]
```

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e219162b3da~tplv-t2oaga2asx-image.image)

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/14/16fa2e21956d6740~tplv-t2oaga2asx-image.image)


我们可以看到，不论是上面的 `npm audit` 报告还是 `Snyk`、`HackerOne` 等其他的安全平台的报告都会附上一个漏洞的 `CVE` 编号。


## 参考

- https://medium.com/npm-inc/security-in-the-js-community-4bac032e553b
- https://zhuanlan.zhihu.com/p/73186974
- https://zhuanlan.zhihu.com/p/27891196
- http://eux.baidu.com/blog/fe/npm%20aduit%E4%BA%8C%E4%B8%89%E4%BA%8B


## 小结

希望看完本篇文章能对你有如下帮助：

- 了解依赖安全漏洞的背景
- 了解 `npm` 自动修复安全漏洞的机制
- 了解一些常规的安全知识，提高对前端安全问题的关注度


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
