---
title: 前端性能优化 - 构建优化
category: 性能和体验
tag: 
- 性能优化
- 构建
- 工程实践
date: 2020-12-27
---

 大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，也可以叫我十七哥。

最近对公司的一个 PC 站点做了一次整体的性能优化，由于这个系统业务复杂、依赖非常多，加载速度非常慢，优化后各个性能指标都有了显著提升，大约加载速度快了 5 倍左右。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8387c980ee2b4594b3c88c5a71acaca2~tplv-k3u1fbpfcp-zoom-1.image)

我在 构建、网络、资源加载、运行时、服务端、功能组织等多个方面都进行了优化，准备做一个系列，分章节给大家分享下我的优化经验。

今天，我们从优化效果最为明显的构建角度开始。

## 优化前

首先我们看一下在优化前站点的资源加载情况：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/47c1e95406084fe697828d949eeb2b9b~tplv-k3u1fbpfcp-zoom-1.image)

可见最大的 `vendor` 包居然有 `3MB`（经过 `gzip` 压缩后），没有做额外配置的话，`webpack` 将所有的第三方依赖都打入了这个包，如果引入依赖越来越多，那么这个包就会越来越大。

另外，系统本身的逻辑打的包也达到了 `600kb`

## 分析依赖关系

我们可以借助 `webpack-bundle-analyzer` 将打包后的内容展示为方便交互的树状图，我们可以很直观的看到有哪些比较大的模块，然后做针对性优化。

```js
npm install --save-dev webpack-bundle-analyzer

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e298be46d97464487175794f31b731d~tplv-k3u1fbpfcp-zoom-1.image)

## CDN 引入

> CDN 的工作原理是将源站的资源缓存到位于全球各地的 CDN 节点上，用户请求资源时，就近返回节点上缓存的资源，而不需要每个用户的请求都回您的源站获取，避免网络拥塞、缓解源站压力，保证用户访问资源的速度和体验。

这个估计大家都明白，因为打包后的产物本身也是上传到 `CDN` 的。但是我们要做的是将体积较大的第三方依赖单独拆出来放到 `CDN` 上，这样这个依赖既不会占用打包资源，也不会影响最终包体积。

如果一个依赖有直接打包压缩好的单文件 `CDN` 资源，例如上面图中的 `g6`，就可以直接使用。

按照官方文档的解释，如果我们想引用一个库，但是又不想让 `webpack` 打包，并且又不影响我们在程序中以 `import、require` 或者 `window/global` 全局等方式进行使用，那就可以通过配置 `externals`。

> `externals` 配置选项提供了「从输出的 bundle 中排除依赖」的方法。相反，所创建的 `bundle` 依赖于那些存在于用户环境(consumer's environment)中的依赖。

首先将 `CDN` 引入的依赖加入到 `externals` 中。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/693f0a72f383455baed6949136e90287~tplv-k3u1fbpfcp-zoom-1.image)

然后借助 `html-webpack-plugin` 将 `CDN` 文件打入 `html`:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73291870db304dcc80cd49c7d434fa9d~tplv-k3u1fbpfcp-zoom-1.image)

这里有一点需要注意，在 `html` 中配置的 `CDN` 引入脚本一定要在 `body` 内的最底部，因为：

- 如果放在 `body` 上面或 `header` 内，则加载会阻塞整个页面渲染。
- 如果放在 `body` 外，则会在业务代码被加载之后加载，模块中使用了该模块将会报错。


## 拆 vendor

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19a841db64bc4a78ac6afd0baed60da8~tplv-k3u1fbpfcp-zoom-1.image)

某些场景下， 一个第三方依赖可能拆成了多个子依赖，例如上面的 `monaco`，或者没有提供可直接通过 `CDN` 引入的文件，我们就无法通过配置一个 `CDN` 文件来引入它了。

这时我们需要自己去 `webpack` 设置一些规则，将我们想拆出来的依赖单独打包一个 `vendor`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/42584ebdea5b4a4faa4ea3e1b9c29a01~tplv-k3u1fbpfcp-zoom-1.image)


## Dynamic import


我们来看 `v8` 中关于 `import` 的描述：

```js
This syntactic form for importing modules is a static declaration: it only accepts a string literal as the module specifier, and introduces bindings into the local scope via a pre-runtime “linking” process. The static import syntax can only be used at the top-level of the file.
```

`CommonJS` 和 `ES Module` 在用法上有个非常大的区别，`CommonJS` 允许你可以在用到的时候再去加载这个模块，而不用全部放到顶部加载。而 `ES Module` 的语法是静态的，静态 `import` 语法只能在文件的顶层使用。这种引用方式有个巨大缺陷，就是无法实现按需引入模块。

```js
<script type="module">
  import * as module from './utils.js';
  module.default();
  // → logs 'Hi from the default export!'
  module.doStuff();
  // → logs 'Doing stuff…'
</script>
```

幸好， `ES Module` 目前也支持了 `Dynamic import` 的用法，动态的 `import` 会返回一个 `promise` ，你可以等待模块加载完成后再去做一些事情，而不用在页面初始化就加载它。

```js
<script type="module">
  const moduleSpecifier = './utils.js';
  import(moduleSpecifier)
    .then((module) => {
      module.default();
      // → logs 'Hi from the default export!'
      module.doStuff();
      // → logs 'Doing stuff…'
    });
</script>

<script type="module">
  (async () => {
    const moduleSpecifier = './utils.js';
    const module = await import(moduleSpecifier)
    module.default();
    // → logs 'Hi from the default export!'
    module.doStuff();
    // → logs 'Doing stuff…'
  })();
</script>
```


将 `vendor` 拆分后，依赖仍然会在首屏被加载，如果依赖不在首屏使用，仍然会造成网络资源的浪费，并阻塞页面渲染，对于没必要在首屏进行加载的依赖，我们可以采用动态 `import` 的方式。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fca104e681c04ed2a084fb4505d5b7d2~tplv-k3u1fbpfcp-zoom-1.image)

例如上面这个 `js-export-excel` 这个依赖，自己本身有将近 `500 kb`，但是其只会在用户点击【导出】按钮的时候使用，我们首先在 `vendor` 中将其拆出来。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b9e7e12062ab4eb186cef1ed069e13e9~tplv-k3u1fbpfcp-zoom-1.image)

使用时，将 `import` 的逻辑由首屏改到运行时异步加载

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e23c9ac9d164a0abdb57c2239c3ffbb~tplv-k3u1fbpfcp-zoom-1.image)

这样的话，`js-export-excel` 这个依赖包只会在用户点击【导出】按钮时引入，首屏不再引入。

> 不是所有依赖都适合异步加载，如果你对使用该依赖有很高的性能要求，然后依赖本身也比较大，这种情况是不适合的，因为你可能会看到明显的延迟。以上 export 其实是一个比较合适的场景，下载 excel 本身需要延迟时间，加上动态加载依赖的时间是可接收的。


## React 懒加载

类似的，对于某些第三方依赖组件，例如 `monaco editor` ，我们只有在很少的业务场景下才会用到，但是其本身一个包占用了 `5MB` 。。我们每次在打开页面时都要加载它，这太耗费性能了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f36f53beb69497dac6c781d4b672b80~tplv-k3u1fbpfcp-zoom-1.image)

对于一个依赖包，我们可以通过动态 `import` 的方式进行懒加载，但是对于一个 `React` 组件，直接使用动态 `import` 可能就不太合适了，组件渲染的运行时都是可多次触发了，不可能在每次组件渲染时都加载一次组件。

`React.lazy` 函数能让你像渲染常规组件一样处理动态引入组件。`React.lazy` 接受一个函数，这个函数需要动态调用 `import()`。它必须返回一个 `Promise`，该 `Promise` 需要 `resolve` 一个 `default export` 的 `React` 组件。

```js
const MonacoEditor = React.lazy(() => import('react-monaco-editor'));
```

此代码将会在组件首次渲染时，自动导入包含 `MonacoEditor` 组件的包。但是直接使用` React.lazy `引入的组件是无法直接使用的，因为 `React` 无法预测组件何时被加载，直接渲染会导致页面崩溃。

在 `Suspense` 组件中渲染 `lazy` 组件，可以使用在等待加载 `lazy` 组件时做优雅降级（如 `loading` ）。`fallback` 属性接受任何在组件加载过程中你想展示的 `React` 元素。你可以将 `Suspense` 组件置于懒加载组件之上的任何位置。你甚至可以用一个 `Suspense` 组件包裹多个懒加载组件。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/768b91f0603c4a62b3f011c43ed45ace~tplv-k3u1fbpfcp-zoom-1.image)


将所有 `monaco editor` 改为懒加载后，首屏已经不会加载 `monaco editor `。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abb8e449b5424b2499c4308ee307d17a~tplv-k3u1fbpfcp-zoom-1.image)


## 路由懒加载 

上面 `React` 懒加载的方式，同样适用于路由，对于每个路由都使用懒加载的方式引入，则每个模块都会被单独打为一个 `js`，首屏只会加载当前模块引入的 `js`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/88d1c507e43b467dbb4f6b441c768c69~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10538b6155c343c69f402187e4b67ed7~tplv-k3u1fbpfcp-zoom-1.image)

> 不过 路由懒加载 也有一个很明显的弊端，就是每个模块的资源是只有加载这个模块的时候才回去下载的，所以在切换模块的时候可能会有一小段白屏或 `loading` 效果，这个要结合业务自身的情况综合判断要不要使用。

## 语言包优化

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0cbff065d9a64617a19a51a0cb34c113~tplv-k3u1fbpfcp-zoom-1.image)

在某些场景下，语言包会占用整个包体积的非常大一部分。实际上库本身的逻辑不会很大，`moment` 就是一个很好例子。

如果最开始选择日期库，那直接推荐使用 `dayjs` 了，如果你选择了 `moment` ，一定要注意把不使用的语言包过滤掉，推荐使用 `ContextReplacementPlugin`，它会告诉 `webpack` 我们会使用到哪个本地文件：

```js
plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
  ]
```

## 优化效果

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a47111494f7441b891654a4fcbdb459~tplv-k3u1fbpfcp-zoom-1.image)

最终优化后，会发现模块已经被我们拆的非常均匀，并且只会在对应页面渲染时加载对应模块，这对首屏渲染速度有显著提升。

如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。

