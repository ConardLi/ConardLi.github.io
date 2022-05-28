---
title: React 新一代状态管理库 Recoil
category: React
tag:
- React
- 方案推荐
- 状态管理
date: 2020-10-06
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

在 `React Europe 2020 Conference` 上， `Facebook` 软件工程师 `Dave McCabe` 介绍了一个新的状态管理库 `Recoil`。

`Recoil` 现在还处于实验阶段，现在已经在 `Facebook` 一些内部产品中用于生产环境。毕竟是官方推出的状态管理框架，之前没时间仔细研究，借着国庆期间看了看，给大家分享一下。

## State 和 Context 的问题

假设我们有下面一个场景：有 `List` 和 `Canvas` 两个组件，List 中一个节点更新后，Canvas 中的节点也对应更新。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10204420dac24cb1a9b4f248c00c3f1b~tplv-k3u1fbpfcp-zoom-1.image)

最常规则做法是将一个 `state` 通过父组件分发给 `List` 和 `Canvas` 两个组件，显然这样的话每次 `state` 改变后 所有节点都会全量更新。

当然，我们还可以使用 `Context API`，我们将节点的状态存在一个 `Context` 内，只要 `Provider` 中的 `props` 发生改变， `Provider` 的所有后代使用者都会重新渲染。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17159fda9b684021a7f84e4f27826e1a~tplv-k3u1fbpfcp-zoom-1.image)

为了避免全量渲染的问题，我们可以把每个子节点存储在单独的 `Context` 中，这样每多一个节点就要增加一层 `Provider`。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d6b847fa1e746fdb80e37b1fab5827e~tplv-k3u1fbpfcp-zoom-1.image)

但是，如果子节点是动态增加的呢？我们还需要去动态增加 `Provider` ，这会让整个树再次重新渲染，显然也是不符合预期的。

## 引入 Recoil

`Recoil` 本身就是为了解决 `React` 全局数据流管理的问题，采用分散管理原子状态的设计模式。

`Recoil` 提出了一个新的状态管理单位 `Atom`，它是可更新和可订阅的，当一个 `Atom` 被更新时，每个被订阅的组件都会用新的值来重新渲染。如果从多个组件中使用同一个 `Atom` ，所有这些组件都会共享它们的状态。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c9fa52cd79f44f98e5bc164b545fcf0~tplv-k3u1fbpfcp-zoom-1.image)

你可以把 `Atom` 想象为为一组 `state` 的集合，改变一个 `Atom` 只会渲染特定的子组件，并不会让整个父组件重新渲染。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1d8ae0be0284687b866a8f9c44994c3~tplv-k3u1fbpfcp-zoom-1.image)

## 用 Redux 或 Mobx 不可以吗？

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6192f9710baf4144bd3b813651b0cfcc~tplv-k3u1fbpfcp-zoom-1.image)

因为 `React` 本身提供的 `state` 状态在跨组件状态共享上非常苦难，所以我们在开发时一般借助一些其他的库如 `Redux、Mobx` 来帮助我们管理状态。这些库目前正被广泛使用，我们也并没有遇到什么大问题，那么 `Facebook` 为什么还要推出一款新的状态管理框架呢？

使用 `Redux、Mobx` 当然可以，并没有什么问题，主要原因是它们本身并不是 `React` 库，我们是借助这些库的能力来实现状态管理。像 `Redux` 它本身虽然提供了强大的状态管理能力，但是使用的成本非常高，你还需要编写大量冗长的代码，另外像异步处理或缓存计算也不是这些库本身的能力，甚至需要借助其他的外部库。

并且，它们并不能访问 `React` 内部的调度程序，而 `Recoil` 在后台使用 `React` 本身的状态，在未来还能提供并发模式这样的能力。

## 基础使用

### 初始化

使用 `recoil` 状态的组件需要使用 `RecoilRoot` 包裹起来：

```
import React from 'react';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState
} from 'recoil';
​
function App() {
  return (
    <RecoilRoot>
      <CharacterCounter />
    </RecoilRoot>
  );
}
```

### 定义状态

上面我们已经提到了 `Atom` 的概念， `Atom` 是一种新的状态，但是和传统的 `state` 不同，它可以被任何组件订阅，当一个 `Atom` 被更新时，每个被订阅的组件都会用新的值来重新渲染。

首先我们来定义一个 `Atom`：

```
export const nameState = atom({
  key: 'nameState',
  default: 'ConardLi'
});
```

这种方式意味着你不需要像 `Redux` 那样集中定义状态，可以像 `Mobx` 一样将数据分散定义在任何地方。

要创建一个 `Atom` ，必须要提供一个 `key` ，其必须在 `RecoilRoot` 作用域中是唯一的，并且要提供一个默认值，默认值可以是一个静态值、函数甚至可以是一个异步函数。

### 订阅和更新状态

`Recoil` 采用 `Hooks` 方式订阅和更新状态，常用的是下面三个 API：

-   `useRecoilState`：类似 useState 的一个 `Hook`，可以取到 `atom` 的值以及 `setter` 函
-   `useSetRecoilState`：只获取 `setter` 函数，如果只使用了这个函数，状态变化不会导致组件重新渲染
-   `useRecoilValue`：只获取状态

```
import { nameState } from './store'
// useRecoilState
const NameInput = () => {
  const [name, setName] = useRecoilState(nameState);
  const onChange = (event) => {
   setName(event.target.value);
  };
  return <>
   <input type="text" value={name} onChange={onChange} />
   <div>Name: {name}</div>
  </>;
}
​
// useRecoilValue
const SomeOtherComponentWithName = () => {
  const name = useRecoilValue(nameState);
  return <div>{name}</div>;
}
​
// useSetRecoilState  
const SomeOtherComponentThatSetsName = () => {
  const setName = useSetRecoilState(nameState);
  return <button onClick={() => setName('Jon Doe')}>Set Name</button>;
}
```

### 派生状态

`selector` 表示一段派生状态，它使我们能够建立依赖于其他 `atom` 的状态。它有一个强制性的 `get` 函数，其作用与 `redux` 的 `reselect` 或 `MobX` 的 `@computed` 类似。

```
const lengthState = selector({
  key: 'lengthState', 
  get: ({get}) => {
    const text = get(nameState);
    return text.length;
  },
});
​
function NameLength() {
  const length = useRecoilValue(charLengthState);
  return <>Name Length: {length}</>;
}
```

> selector 是一个纯函数：对于给定的一组输入，它们应始终产生相同的结果（至少在应用程序的生命周期内）。这一点很重要，因为选择器可能会执行一次或多次，可能会重新启动并可能会被缓存。

### 异步状态

`Recoil` 提供了通过数据流图将状态和派生状态映射到 `React` 组件的方法。真正强大的功能是图中的函数也可以是异步的。这使得我们可以在异步 `React` 组件渲染函数中轻松使用异步函数。使用 `Recoil` ，你可以在选择器的数据流图中无缝地混合同步和异步功能。只需从选择器 `get` 回调中返回 `Promise` ，而不是返回值本身。

例如下面的例子，如果用户名存储在我们需要查询的某个数据库中，那么我们要做的就是返回一个 `Promise` 或使用一个 `async` 函数。如果 `userID` 发生更改，就会自动重新执行新查询。结果会被缓存，所以查询将仅对每个唯一输入执行一次（所以一定要保证 selector 纯函数的特性，否则缓存的结果将会和最新的值不一致）。

```
const userNameQuery = selector({
  key: 'userName',
  get: async ({get}) => {
    const response = await myDBQuery({
      userID: get(currentUserIDState),
    });
    return response.name;
  },
});
​
function CurrentUserInfo() {
  const userName = useRecoilValue(userNameQuery);
  return <div>{userName}</div>;
}
```

`Recoil` 推荐使用 `Suspense`，`Suspense` 将会捕获所有异步状态，另外配合 `ErrorBoundary` 来进行错误捕获：

```
function MyApp() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <CurrentUserInfo />
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  );
}
```

## 总结

`Recoil` 推崇的是分散式的状态管理，这个模式很类似于 `Mobx`，使用起来也感觉有点像 `observable + computed` 的模式，但是其 API 以及核心思想设计的又没有 `Mobx` 一样简洁易懂，反而有点复杂，对于新手上手起来会有一定成本。

在使用方式上完全拥抱了函数式的 `Hooks` 使用方式，并没有提供 `Componnent` 的使用方式，目前使用原生的 `Hooks API` 我们也能实现状态管理，我们也可以使用 `useMemo` 创造出派生状态，`Recoil` 的 `useRecoilState` 以及 `selector` 也比较像是对 `useContext、useMemo` 的封装。

但是毕竟是 `Facebook` 官方推出的状态管理框架，其主打的是高性能以及可以利用 `React` 内部的调度机制，包括其承诺即将会支持的并发模式，这一点还是非常值得期待的。

另外，其本身的分散管理原子状态的模式、读写分离、按需渲染、派生缓存等思想还是非常值得一学的。


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
