---
title: npm install 原理分析
date: 2019-12-28 11:08:00
tags:
     - 工程化
---

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191216204254.png)

开门见山，`npm install` 大概会经过上面的几个流程，本篇文章来讲一讲各个流程的实现细节、发展以及为何要这样实现。


## 嵌套结构

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

## 扁平结构

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

## Lock文件

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

### 使用建议

开发系统应用时，建议把 `package-lock.json` 文件提交到代码版本仓库，从而保证所有团队开发者以及 `CI` 环节可以在执行 `npm install` 时安装的依赖版本都是一致的。


在开发一个 `npm`包 时，你的 `npm`包 是需要被其他仓库依赖的，由于上面我们讲到的扁平安装机制，如果你锁定了依赖包版本，你的依赖包就不能和其他依赖包共享同一 `semver` 范围内的依赖包，这样会造成不必要的冗余。所以我们不应该把`package-lock.json` 文件发布出去（ `npm` 默认也不会把 `package-lock.json` 文件发布出去）。


## 缓存

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


## 文件完整性

上面我们多次提到了文件完整性，那么什么是文件完整性校验呢？

在下载依赖包之前，我们一般就能拿到 `npm` 对该依赖包计算的 `hash` 值，例如我们执行 `npm info` 命令，紧跟 `tarball`(下载链接) 的就是 `shasum`(`hash`) ：

![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20191212220916.png)

用户下载依赖包到本地后，需要确定在下载过程中没有出现错误，所以在下载完成之后需要在本地在计算一次文件的 `hash` 值，如果两个 `hash` 值是相同的，则确保下载的依赖是完整的，如果不同，则进行重新下载。



## 整体流程

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

## yarn

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

https://juejin.im/post/5a6008c2f265da3e5033cd93

https://www.zhihu.com/question/305539244/answer/551386426

https://zhuanlan.zhihu.com/p/37285173