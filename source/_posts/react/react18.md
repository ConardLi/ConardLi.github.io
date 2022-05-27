---
title: 试用 React 18 ！
category: React
tag:
- React
date: 2021-06-13
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


React 团队最近发布了 React 18 的 alpha 版本。这个版本主要是增强 React 应用程序的 `并发渲染` 能力，你可以在 React 18 中尝试体验以下几个新特性：

- 新的 `ReactDOM.createRoot()` API（替换 `ReactDOM.render()`）
- 新的 `startTransition` API（用于非紧急状态更新）
- 渲染的自动批处理优化（主要解决异步回调中无法批处理的问题）
- 支持 `React.lazy` 的 全新 SSR 架构（支持 `<Suspense>` 组件）

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d96a57a7220c4faa875fa07071214c3e~tplv-k3u1fbpfcp-zoom-1.image)


这不，这个版本才刚刚发布社区里已经有很多小伙伴已经跃跃欲试了，我也迫不及待跟着社区的大佬们一起尝试了一下。感兴趣的小伙伴们可以一起跟着我的记录来试一下：


## 安装 React 18 Alpha

想要在你的项目里试用 React 18 Alpha，可以尝试执行下面的命令：

```
npm install react@alpha react-dom@alpha
# or
yarn add react@alpha react-dom@alpha
```


如果你是使用 `Create React App` 初始化的项目，你可能会遇到一个由于 `react-scripts` 引起的 `could not resolve dependency` 错误：

```
Could not resolve dependency:
peer react@">= 16" from react-scripts@4.0.3
```

你可以在安装的时候尝试加上 `--force` 来解决这个问题：

```npm
npm install react@alpha react-dom@alpha --force
```

## ReactDOM.createRoot() 

在 React 18 版本中，`ReactDOM.createRoot()` 替代了通常作为程序入口的  `ReactDOM.render()` 方法。

这个方法主要是防止  React 18 的不兼容更新导致你的应用程序崩溃。

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
const container = document.getElementById('root');
// Create a root.
const root = ReactDOM.createRoot(container);
// Render the top component to the root.
root.render(<App />);
```


> 当你更新到 React 18 时，如果你还使用 redner 函数作为程序入口，控制台会打印一个错误日志来提醒你使用 createRoot() ，只有使用了这个方法后才能使用 React 18 新功能。

## 渲染的自动批处理

React 有一道经典面试题，`setState` 到底是同步的还是异步的，我面试的时候也会经常问，具体的我在两年前的一篇文章中有介绍过：

[由实际问题探究setState的执行机制](https://mp.weixin.qq.com/s/vDJ_Txm4wi-cMVlX5xypLg)

```jsx
class Example extends React.Component {
  constructor() {
    super();
    this.state = {
      val: 0
    };
  }
  
  componentDidMount() {
    this.setState({val: this.state.val + 1});
    console.log(this.state.val);   
    this.setState({val: this.state.val + 1});
    console.log(this.state.val);   

    setTimeout(() => {
      this.setState({val: this.state.val + 1});
      console.log(this.state.val); 
      this.setState({val: this.state.val + 1};
      console.log(this.state.val);  
    }, 0);
  }

  render() {
    return null;
  }
};
```

比如上面的代码，我们来考虑一下两种情况：

- 假设 React 完全没有批处理机制，那么执行一个 setState 就会立即触发一次页面渲染，打印顺序应该是 1、2、3、4
- 假设 React 有一个完美的批处理机制，那么应该等整个函数执行完了之后再统一处理所有渲染，打印顺序应该是 0、0、0、0

实际上，在 React 18 版本之前，上面代码的打印顺序是 0、0、2、3

出现这个问题的主要原因就是在 `React` 的事件函数和异步回调中的状态批处理机制不一样。在异步回调外面，能够将所有渲染合并成一次，异步回调里面，则不会合并，会渲染多次。

实际上，在大部分的场景下，我们都需要在调用一个接口或者做了一些其他事情之后，再去回调函数里更新状态，上面的批处理机制就会显得非常鸡肋。

现在，React 18 版本解决了这个问题，无论你是在 Promise、setTimeout、或者其他异步回调中更新状态，都会触发批处理，上面的代码真的就会一直打印 `0、0、0、0` 了！

> 是不是很棒！React 帮我们消灭的一道面试题 😎。

通常情况下，批处理是没什么问题的，但是有可能在某些特殊的需求（比如某个状态更改后要立刻从 DOM 中获取一些内容）下不太合适，我们可以使用 `ReactDOM.flushSync()` 退出批处理：


```jsx
import { flushSync } from 'react-dom'; // Note: react-dom, not react

function handleClick() {
  flushSync(() => {
    setCounter(c => c + 1);
  });
  // React has updated the DOM by now
  flushSync(() => {
    setFlag(f => !f);
  });
  // React has updated the DOM by now
}
```

`Ricky` 在这篇文章（`https://github.com/reactwg/react-18/discussions/21`） 详细介绍了 `Automatic batching` ，感兴趣可以一起到评论区讨论。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d74e97df01c4b6fbd5df14b111c5e2f~tplv-k3u1fbpfcp-zoom-1.image)


##  SSR 下的懒加载支持
 

`React.lazy` 函数能让你像渲染常规组件一样处理动态引入组件。`React.lazy` 接受一个函数，这个函数需要动态调用 `import()`。它必须返回一个 `Promise`，该 `Promise` 需要 `resolve` 一个 `default export` 的 React 组件。


```jsx
const MonacoEditor = React.lazy(() => import('react-monaco-editor'));
```


`React.lazy` 必须要配合 `<Suspense>` 才能更好的使用，在 `Suspense` 组件中渲染 `lazy` 组件，可以使用在等待加载 `lazy` 组件时做优雅降级（比如渲染一些 `loading` 效果 ）。`fallback` 属性接受任何在组件加载过程中你想展示的 `React` 元素。

```jsx
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    // Displays <Spinner> until OtherComponent loads
    <React.Suspense fallback={<Spinner />}>
      <div>
        <OtherComponent />
      </div>
    </React.Suspense>
  );
}
```

在 `React 18` 以前， SSR 模式下是不支持使用 `Suspense` 组件的，而在 React 18 中服务端渲染的组件也支持使用 `<Suspense>` 了：如果你把组件包裹在了 `<Suspense>`
 中，服务端首先会把 `fallback` 中的组件作为 HTML 流式传输，一旦主组件加载完成，React 会发送新的 `HTML` 来替换该组件。
 


```jsx
<Layout> 
  < Article /> 
  <Suspense fallback={<Spinner />}>
     <Comments /> 
  </Suspense>
 </Layout>
```

比如上面的代码，`<Article>` 组件首先会被渲染，`<Comments>` 组件将被 `fallback` 替换为 `<Spinner>` 。一旦 `<Comments>` 组件加载完成后，React 会才将其发送到浏览器，替换 `<Spinner>` 组件。

 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b0e346ee419a426fbc13c7d6e3ae10c8~tplv-k3u1fbpfcp-zoom-1.image)

`Dan Abramov` 在这篇文章（`https://github.com/reactwg/react-18/discussions/37`） 中详细介绍了这个机制，感兴趣可以到评论区一起讨论。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3b3ddc4e234a48149e42c522e751e25c~tplv-k3u1fbpfcp-zoom-1.image)


## startTransition API

`startTransition` 是 React 18 新增加的一个 API，它可以让你区分 `非紧急` 的状态更新。

比如现在有这样一个场景：我们要去 `Input` 框输入一个值，然后下面需要同时给出通过我们输入后的值过滤出来的一些数据。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9620c879fc3f44caa976676360a4724d~tplv-k3u1fbpfcp-zoom-1.image)

因为你每次需要动态渲染出过滤后的值，所以你可能会将输入的值存储在一个 `state` 中，你的代码可能是下面这样的：

```js
setInputValue (input) ; 
setSearchQuery (input) ;
```



首先用户输入上去的值肯定是需要立刻渲染出来的，但是过滤出来的联想数据可能不需要那么快的渲染，如果我们不做任何额外的处理，在 React 18 之前，所有更新都会立刻被渲染，如果你的原始数据非常多，那么每次输入新的值后你需要进行的计算量（根据输入的值过滤出符合条件的数据）就非常大，所以每次用户输入后可能会有卡顿现象。


所以，在以前我们可能会自己去加一些防抖这样的操作去人为的延迟过滤数据的计算和渲染。

新的 startTransition API 可以让我们把数据标记成 `transitions` 状态。

```js
import { startTransition } from 'react';


// Urgent: Show what was typed
setInputValue(input);

// Mark any state updates inside as transitions
startTransition(() => {
  // Transition: Show the results
  setSearchQuery(input);
});
```


所有在 `startTransition` 回调中的更新都会被认为是 `非紧急处理`，如果出现更紧急的更新（比如用户又输入了新的值），则上面的更新都会被中断，直到没有其他紧急操作之后才会去继续执行更新。

> 怎么样，是不是比我们人工实现一个防抖更优雅 😇

同时，React 还给我们提供了一个带有 `isPending` 过渡标志的 `Hook`：

```jsx
import  {  useTransition  }  from  'react' ; 

const  [ isPending ,  startTransition ]  =  useTransition ( ) ;

```

你可以使用它和一些 `loading` 动画结合使用：

```jsx
{ isPending  &&  < Spinner  / > }

```

`Ricky` 在这篇文章（`https://github.com/reactwg/react-18/discussions/41`） 详细介绍了 `startTransition` ，感兴趣可以一起到评论区讨论。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51f69b52bfc046688075561e31a55ec4~tplv-k3u1fbpfcp-zoom-1.image)

## React 18 发布计划

React 18 官方介绍（`https://github.com/reactwg/react-18/discussions/4`）中提到的其他两个 API `useDeferredValue`、`<SuspenseList>` 还没 `released` ，我们下次再用，下面是 React 18 的发布时间表：

- `React 18 Alpha` 版本：现在就能用
- 公开的 Beta 版：至少在 Alpha 版本后的几个月
- RC 版本：至少在 Beta 版发布后的几周
- 正式版：至少在 RC 版本发布之后的几周

## 参考

- https://github.com/reactwg/react-18/discussions/4 
- https://github.com/reactwg/react-18/discussions/41
- https://github.com/reactwg/react-18/discussions/37
- https://blog.bitsrc.io/trying-out-react-18-alpha-release-bad9aed12bee

## 最后

如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
