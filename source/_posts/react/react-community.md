---
title: 2022 年的 React 生态
category: React
tag: React
date: 2022-04-11
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

今天我们来聊 `React`，`React` 已经风靡前端届很长一段时间了，在这段时间里它发展了一个非常全面而强大的生态系统。大厂喜欢在大型的前端项目中选择 `React`，它的生态功不可没。

今天的文章，我们将从状态管理、样式和动画、路由、代码风格等多个方面来看看 `React` 最新的生态，希望你以后在做技术选型的时候能够有所帮助。


## 创建 React 项目

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/16f9b57ffcdf4c9ea10652e1f2e4cad1~tplv-k3u1fbpfcp-zoom-1.image)

对于大多数 `React` 初学者来说，在刚刚开始学习 `React` 时如何配置一个 `React` 项目往往都会感到迷惑，可以选择的框架有很多。`React` 社区中大多数会给推荐 `Facebook` 的 `create-react-app (CRA)`。它基本上零配置，为你提供开箱即用的简约启动和运行 `React` 应用程序。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/865c5a22e66e465ba1368fdbd0dc3973~tplv-k3u1fbpfcp-zoom-1.image)


但现在来看，`CRA` 使用的工具过时了 — 从而导致我们的开发体验变慢。`Vite` 是近期最受欢迎的打包库之一，它具有令人难以置信的开发和生产速度，而且也提供了一些模板（例如 `React、React + TypeScript`）可以选择。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e7fcf678ccc0436188ddc4f457420be5~tplv-k3u1fbpfcp-zoom-1.image)


如果你已很经熟悉 `React` 了，你可以选择它最流行的框架之一作为替代：`Next.js` 和 `Gatsby.js`。这两个框架都基于 `React` 建立，因此你应该至少熟悉了 `React` 的基础知识再去使用。这个领域另一个流行的新兴框架是 `Remix`，它在 2022 年绝对值得一试。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a4c49958a5f47579194e495861393f4~tplv-k3u1fbpfcp-zoom-1.image)

虽然 `Next.js` 最初是用来做服务端渲染的，而 `Gatsby.js` 主要用来做静态站点生成（例如博客和登录页面等静态网站）。然而，在过去几年里，这两个框架之间一直在互相卷... 

`Next.js` 可以支持你生成静态站点，而 `Gatsby.js` 也支持了服务端渲染。不过就我个人的使用体验而言，我会觉得 `Next.js` 更好用一点。


如果你只想了解一下 `create-react-app` 这些工具在后台的工作原理，建议尝试一下自己从头开始配置一个 `React` 项目。从一个简单的 `HTML JavaScript` 项目开始，并自己添加 `React` 及其支持工具（例如 `Webpack、Babel`）。这并不是你在日常工作中必须要做的事情，但这是了解底层工具实现原理的一个很好的方式。


建议：

- 优先使用 `Vite` 创建 `React` 客户端应用
  - CRA 备选
- 优先使用 `Next.js` 创建 `React` 服务端渲染应用
  - 最新技术：`Remix`
  - 仅创建静态站点备选 `Gatsby.js`
- 可选的学习经验：从0自己搭建一个 `React` 应用。

链接：

- `create-react-app`：https://github.com/facebook/create-react-app
- `Vite`：https://github.com/vitejs/vite
- `Next.js`：https://github.com/vercel/next.js
- `Gatsby.js`：https://github.com/gatsbyjs/gatsby
- `Remix`：https://github.com/remix-run/remix

阅读：

- 《[React 基础](https://beta.reactjs.org/learn)》
- 《[了解为什么像 React 这样的框架很重要](https://www.robinwieruch.de/why-frameworks-matter/)》
- 《[如何创建现代 JavaScript 项目](https://www.robinwieruch.de/javascript-project-setup-tutorial/)》
- 《[Gatsby vs. Next.js vs. Remix](https://satellytes.com/blog/getting-started-gatsby-next-remix/)》
- 《[React 框架运行时优化方案的演进](https://mp.weixin.qq.com/s/4qzm5pFmvdDUncN4txiBPA)》

------
## 状态管理


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cccf4c46874a4342897f1e069b6478be~tplv-k3u1fbpfcp-zoom-1.image)

`React` 带有两个内置的 `Hooks` 来管理本地状态：`useState` 和 `useReducer`。如果需要全局状态管理，可以选择加入 `React` 内置的 `useContext Hook` 来将 `props` 从顶层组件传递到底层组件，从而避免 `props` 多层透传的问题。这三个 `Hooks` 足以让你实现一个强大的状态管理系统了。

如果你发现自己过于频繁地使用 `React` 的 `Context` 来处理共享/全局状态，你一定要看看 `Redux`，它是现在最流行的状态管理库。它允许你管理应用程序的全局状态，任何连接到其全局存储的 `React` 组件都可以读取和修改这些状态。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73ddcac9e6914d8eb897569a82b4716a~tplv-k3u1fbpfcp-zoom-1.image)


如果你碰巧在用 `Redux`，你一定也应该查看 `Redux Toolkit`。它是基于 `Redux` 的一个很棒的 `API`，极大地改善了开发者使用 `Redux` 的体验。

作为替代方案，如果你喜欢用全局存储的思想管理状态，但不喜欢 `Redux` 的处理方式，可以看看其他流行的本地状态管理解决方案，例如 `Zusand、Jotai、XState` 或 `Recoil` 。

另外，如果你想拥有和 `Vue.js` 一样的开发体验，建议看看 `Mobx` 。

建议：

- 用 `useState/useReducer` 处理共享状态
- 选择性使用 `useContext` 管理某些全局状态
- 用 `Redux`(或另一种选择) 管理全局状态

链接：

- `Redux`：https://redux.js.org/
- `Mobx`：https://github.com/mobxjs/mobx
- `Zusand`：https://github.com/pmndrs/zustand
- `Jotai`：https://github.com/pmndrs/jotai
- `XState`：https://github.com/statelyai/xstate
- `Recoil`：https://github.com/facebookexperimental/Recoil

阅读：

- 《[useReducer、useState、useContext 使用指南](https://www.robinwieruch.de/react-state-usereducer-usestate-usecontext/)》
- 《[React 体系下关于 Mobx 与 Redux 的一些思考](https://zhuanlan.zhihu.com/p/461844358)》
- 《[Facebook 新一代 React 状态管理库 Recoil](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490540&idx=1&sn=a8be59aebdb47ab88aae65bb61ed83f7&chksm=c2e2eec7f59567d18a386a911d6f9ba6a15e32bee8372f30cfd89ac88eecacb23de3aefaad5d&scene=178&cur_album_id=2160444600824430594#rd)》
- 《[使用 React&Mobx 的几个最佳实践](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490582&idx=1&sn=bdd65aaaabd64513da451411337d7f5d&chksm=c2e2e93df595602be8285512068aef7b7121844e643fbcaf2e9cd90daf8cf8683359b4742ea4&scene=178&cur_album_id=2160444600824430594#rd)》

------

## 远程数据请求


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/df89c9601ad8404188516fc0ff72bb8a~tplv-k3u1fbpfcp-zoom-1.image)


`React` 的内置 `Hooks` 非常适合 UI 状态管理，但当涉及到远程数据的状态管理（也包括数据获取）时，我建议使用一个专门的数据获取库，例如 `React Query`，它自带内置的状态管理功能。虽然 `React Query` 本身的定位并不是一个状态管理库，它主要用于从 `API` 获取远程数据，但它会为你处理这些远程数据的所有状态管理(例如缓存，批量更新)。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a09cf27584240f6b1f5fa6e7d955441~tplv-k3u1fbpfcp-zoom-1.image)


`React Query` 最初是为使用 `REST API` 而设计的，但是现在它也支持了 `GraphQL`。然而如果你正在为你的 `React` 项目寻找专门的 `GraphQL` 库，我还是推荐你去看看 `Apollo Client`（当前最流行的）、`urql`（轻量级）或 `Relay`（`Facebook` 维护）。

如果你已经在使用 `Redux`，并且想要在 `Redux` 中添加集成状态管理的数据请求功能，建议你看看 `RTK Query`，它将数据请求的功能更巧妙的集成到 `Redux` 中。

建议：

- `React Query`（REST API、GraphQL API 都有）
- `Apollo Client`（只有 GraphQL API）
- 可选的学习经验：了解 `React Query` 的工作原理

链接：

- `React Query`：https://react-query.tanstack.com/
- `Apollo Client`：https://www.apollographql.com/docs/react/
- `urql`：https://formidable.com/open-source/urql/
- `Relay`：https://github.com/facebook/relay
- `RTK Query`：https://redux-toolkit.js.org/rtk-query/overview

阅读：

- 《[React Query 的工作原理](https://www.robinwieruch.de/react-hooks-fetch-data/)》
- 《[本地和远程数据的 React 状态的一切](https://www.robinwieruch.de/react-state/)》

------

## 路由

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/696bd516ff884453b0edd63c9fddda0b~tplv-k3u1fbpfcp-zoom-1.image)

如果你使用的是像 `Next.js` 或 `Gatsby.js` 这样的 `React` 框架，那么路由已经为你处理好了。但是，如果你在没有框架的情况下使用 `React` 并且仅用于客户端渲染（例如 `CRA`），那么现在最强大和流行的路由库是 `React Router`。

链接：

- `React Router`：https://reactrouter.com/

阅读：

- 《[深入 React-Router 实现原理](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490489&idx=1&sn=870782908c86a71ea740c63a4c6999f8&chksm=c2e2ee92f595678404899f8c19033ae683ba53073a1743b73ccb46d0167ae9cac2d3f9a47e68&scene=178&cur_album_id=2160444600824430594#rd)》

------

## 样式/CSS

在 `React` 中有很多关于 `样式/CSS` 的选项和意见，作为一个 `React` 初学者，可以使用一个带有所有 `CSS` 属性的样式对象作为 `HTML` 样式属性的键/值对，从内联样式和基本的 CSS 开始就可以。

```jsx
const ConardLi = ({ title }) =>
  <h1 style={{ color: 'blue' }}>
    {title}
  </h1>
```

内联样式可以在 `React` 中通过 `JavaScript` 动态添加样式，而外部 `CSS` 文件可以包含 `React` 应用的所有剩余样式：

```jsx
import './Headline.css';

const ConardLi = ({ title }) =>
  <h1 className="ConardLi" style={{ color: 'blue' }}>
    {title}
  </h1>
```

如果你的应用越来越大了，建议再看看其他选项。首先，我建议你将 `CSS Module` 作为众多 `CSS-in-CSS` 解决方案的首选。`CRA` 支持  `CSS Module` ，并为提供了一种将 `CSS` 封装到组件范围内的模块的方法。这样，它就不会意外泄露到其他 `React` 组件的样式中。你的应用的某些部分仍然可以共享样式，但其他部分不必访问它。在 React 中， `CSS Module` 通常是将 `CSS` 文件放在 `React` 组件文件中：

```jsx
import styles from './style.module.css';

const ConardLi = ({ title }) =>
  <h1 className={styles.headline}>
    {title}
  </h1>
```


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/60b6ed2e3efc4b3497e5a3940e0f0604~tplv-k3u1fbpfcp-zoom-1.image)


其次，我想向你推荐所谓的 `styled components` ，作为 `React` 的众多 `CSS-in-JS` 解决方案之一。它通过一个名为 `styles-components`(或者其他例如 `emotion 、stitches`)的库来实现的，它一般将样式放在 `React` 组件的旁边：


```jsx
import styled from 'styled-components';

const BlueHeadline = styled.h1`
  color: blue;
`;

const ConardLi = ({ title }) =>
  <BlueHeadline>
    {title}
  </BlueHeadline>
```


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f7c9fd0e742b49158cdd176359b26764~tplv-k3u1fbpfcp-zoom-1.image)


第三，我想推荐 `Tailwind CSS` 作为最流行的 `Utility-First-CSS` 解决方案。它提供了预定义的 `CSS` 类，你可以在 `React` 组件中使用它们，而不用自己定义。这可以提升一些效率，并与你的 `React` 程序的设计系统保持一致，但同时也需要了解所有的类：

```jsx
const ConardLi = ({ title }) =>
  <h1 className="text-blue-700">
    {title}
  </h1>
```

使用 `CSS-in-CSS、CSS-in-js` 还是函数式 `CSS` 由你自己决定。所有的方案在大型 `React` 应用中都适用。最后一点提示：如果你想在 `React` 中有条件地应用一个 `className`，可以使用像 `clsx` 这样的工具。

建议：

- `CSS-in-CSS` 方案： `CSS Modules` 
- `CSS-in-JS` 方案： `Styled Components` （目前最受欢迎）
  - 备选： `Emotion` 或 `Stitches`
- 函数式 CSS：`Tailwind CSS` 
- 备选：CSS 类的条件渲染：`clsx`

链接：

- `styled-components`：https://www.robinwieruch.de/react-styled-components/
- `Tailwind CSS`：https://tailwindcss.com/
- `clsx`：https://github.com/lukeed/clsx

阅读：

- 《[React中CSS-in-JS的最佳实践](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490725&idx=1&sn=266ad0c255e8a8d09453c11d5da83676&chksm=c2e2e98ef5956098c8291f1f484d2363e59ac256936779147c5ed5ed073b52652a12c5f17f7f&token=907147968&lang=zh_CN#rd)》
- 《[React中的CSS样式](https://www.robinwieruch.de/react-css-styling/)》
- 《[10种现在流行的CSS解决方案](https://juejin.cn/post/6844903633109139464)》：
- 《[CSS-in-JS vs CSS](https://bejamas.io/blog/css-performance/)》
- 《[看完了 2021 CSS 年度报告，我学到了啥？](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247491460&idx=1&sn=08759537606f44b55a29ad0c35c0ce1b&chksm=c2e2eaaff59563b90e450cec8878c8c0173e6785b32c1499bbf7131435674e00dd2989cd53bc&token=907147968&lang=zh_CN#rd)》

------
## 组件库

对于初学者来说，从零开始构建可复用的组件是一个很好的学习经验，值得推荐。无论它是 `dropdown、radio button` 还是 `checkbox` ，你最终都应该知道如何创建这些UI组件组件。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d007dd3fef0343469b902a5776d28736~tplv-k3u1fbpfcp-zoom-1.image)


然而，在某些时候，你想要使用一个UI组件库，它可以让你访问许多共享一套设计系统的预构建组件。以下所有的UI组件库都带有基本组件，如 `Buttons、Dropdowns、Dialogs` 和 `Lists`：

- `Material UI` (MUI) (最流行)：https://material-ui.com/
- `Mantine` (最推荐)：https://mantine.dev/
- `Chakra UI` (最推荐)：https://chakra-ui.com/
- `Ant Design`（国内最流行）：https://ant.design/
- `Radix`：https://www.radix-ui.com/
- `Primer`：https://primer.style/react/
- `NextUI`：https://nextui.org/
- `Tailwind UI` (收费的)：https://www.tailwindui.com/
- `Semantic UI`：https://www.robinwieruch.de/react-semantic-ui-tutorial
- `React Bootstrap`：https://react-bootstrap.github.io/

尽管所有这些UI组件库都带有许多内部组件，但它们不能让每个组件都像只专注于一个UI组件的库那样强大。例如 `react-table-library` 提供了非常强大的表格组件，同时提供了主题（例如 `Material UI`），可以很好的和流行的UI组件库兼容。

阅读：

- 《[从零到一搭建React组件库](https://segmentfault.com/a/1190000039852833)》


------
## 动画库


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5dfb85c41b7747059d2a2f8f53361f23~tplv-k3u1fbpfcp-zoom-1.image)

`Web` 应用中的大多数动画都是从 `CSS` 开始的。最终你会发现 `CSS` 动画不能满足你所有的需求。通常开发者会选择 `React Transition Group`，这样他们就可以使用 `React`组件来执行动画了，`React` 的其他知名动画库有：

- `Framer Motion` (最推荐)：https://www.framer.com/motion/
- `react-spring` (也推荐一下)：https://github.com/react-spring/react-spring
- `react-motion`：https://github.com/chenglou/react-motion
- `react-move`：https://github.com/sghall/react-move
- `Animated` (React Native)：https://facebook.github.io/react-native/docs/animated



------
## 可视化图表


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f5d7c5c53ae4fa898618c8f73726ce8~tplv-k3u1fbpfcp-zoom-1.image)


如果你真的想要自己从头开始开发一些图表，那么就没有办法绕过 `D3` 。这是一个很底层的可视化库，可以为你提供开发一些炫酷的图表所需的一切。然而，学习 `D3` 是很有难度的，因此许多开发者只是选择一个 `React` 图表库，这些库默认封装了很多能力，但是缺失了一些灵活性。以下是一些流行的解决方案:

- `Recharts`：http://recharts.org/
- `react-chartjs`：https://github.com/reactchartjs/react-chartjs-2
- `nivo`：https://nivo.rocks/
- `visx`：https://github.com/airbnb/visx
- `Victory`：https://formidable.com/open-source/victory/

------

## 表单


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dcb88d19d6984bf7845355dbe0517c8c~tplv-k3u1fbpfcp-zoom-1.image)

`React` 现在最受欢迎的表单库是 `React Hook Form` 。它提供了从验证（一般会集成 `yup` 和 `zod`）到提交到表单状态管理所需的一切。之前流行的另一种方式是 `Formik`。两者都是不错的解决方案。这个领域的另一个选择是 `React Final Form` 。毕竟，如果你已经在使用 `React` UI组件库了，你还可以查看他们的内置表单解决方案。

建议：

- `React Hook Form`
  -  集成 `yup` 或 `zod` 进行表单验证
- 如果已经在使用组件库了，看看内置的表单能不能满足需求

链接：

- `React Hook Form`：https://react-hook-form.com/
- `Formik`：https://github.com/jaredpalmer/
- `React Final Form`：https://final-form.org/react

阅读：

- 《[React 开源表单组件最佳实践，原理解析，设计分析](https://toutiao.io/posts/0nh4r9w/preview)》

------
## 类型检查

`React` 带有一个名为 `PropTypes` 的内部类型检查。通过使用 `PropTypes`，你可以为你的 `React` 组件定义 `props`。每当将类型错误的 `prop` 传递给组件时，你可以在运行时收到错误消息：

```jsx
import PropTypes from 'prop-types';

const List = ({ list }) =>
  <div>
    {list.map(item => <div key={item.id}>{item.title}</div>)}
  </div>

List.propTypes = {
  list: PropTypes.array.isRequired,
};
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/250e1cb24cc840debaca7023072b6968~tplv-k3u1fbpfcp-zoom-1.image)

在过去的几年里，`PropTypes` 已经不那么流行了，`PropTypes` 也已经不再包含在 `React` 核心库中了，现在 `TypeScript` 才是最佳的选择：

```jsx
type Item = {
  id: string;
  title: string;
};

type ListProps = {
  list: Item[];
};

const List: React.FC<ListProps> = ({ list }) =>
  <div>
    {list.map(item => <div key={item.id}>{item.title}</div>)}
  </div>
```

阅读：

- 《[TypeScript 终极初学者指南](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493477&idx=1&sn=f6a74b2352fbdf3036f06049789e2baf&chksm=c2e1124ef5969b589eb603330f0ceb293b0908df20f7bf6df58218e7b068f0993883a84c4f32&token=907147968&lang=zh_CN#rd)》：https://mp.weixin.qq.com/s/6DAyXFHIMW95FS0f3GyHpA
- 《[如何优雅地在 React 中使用TypeScript](https://juejin.cn/post/7021674818621669389)》



------
## 代码风格


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/94de4c7cea6b4ea1b81a5953c52f2604~tplv-k3u1fbpfcp-zoom-1.image)

对于代码风格，基本上有两种方案可以选择：

如果你想要一种统一的、通用的代码风格，在你的 `React` 项目中使用 `ESLint` 。像 `ESLint` 这样的 `linter` 会在你的 `React` 项目中强制执行特定的代码风格。例如，你可以在 `ESLint` 中要求遵循一个流行的风格指南(如 `Airbnb` 风格指南)。之后，将 `ESLint` 与你的IDE/编辑器集成，它会指出你的每一个错误。

如果你想采用统一的代码格式，可以在 `React` 项目中使用 `Prettier`。它是一个比较固执的代码格式化器，可选择的配置很少。你也可以将它集成到编辑器或IDE中，以便在每次保存文件的时候自动对代码进行格式化。虽然 `Prettier` 不能取代 `ESLint`，但它可以很好地与 `ESLint` 集成。

建议：

- `ESLint`：https://eslint.org/
- `Prettier`：https://github.com/prettier/prettier

阅读：

- 《[React 代码风格指南](https://keqingrong.cn/blog/2020-05-04-code-style-guide-for-react/)》
- 《[Airbnb 样式指南](https://www.robinwieruch.de/react-libraries/)》

------
## 身份认证


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f81e3fdeb11406cbb0c69e2d3b7d375~tplv-k3u1fbpfcp-zoom-1.image)

在 `React` 应用程序中，你可能希望引入带有注册、登录和退出等功能的身份验证。通常还需要一些其他功能，例如密码重置和密码更改功能。这些能力远远超出了 `React` 的范畴，我们通常会把它们交给服务端去管理。

最好的学习经验是自己实现一个带有身份验证的服务端应用(例如 `GraphQL` 后端)。然而，由于身份验证有很多安全风险，而且并不是所有人都了解其中的细节，我建议使用现有的众多身份验证解决方案中的一种：

- `Firebase`：https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial/
- `Auth0`：https://auth0.com/
- `AWS Cognito`：https://aws.amazon.com/cognito/

阅读：

- 《[使用 React Router 进行身份验证](https://www.robinwieruch.de/react-router-authentication/)》

------
## 测试

现在最常见的 `React` 测试方案还是 `Jest`，它基本上提供了一个全面的测试框架所需要的一切。

你可以使用 `react-test-renderer` 在你的 `Jest` 测试中渲染 `React` 组件。这已经足以使用 `Jest` 执行所谓的 `Snapshot Tests` 了：一旦运行测试，就会创建 `React` 组件中渲染的 `DOM` 元素的快照。当你在某个时间点再次运行测试时，将创建另一个快照，这个快照会和前一个快照进行 `diff`。如果存在差异，`Jest` 将发出警告，你要么接受这个快照，要么更改一下组件的实现。

最近 ` React Testing Library (RTL) ` 也比较流行（在 `Jest` 测试环境中使用），它可以为 `React` 提供更精细的测试。`RTL` 支持让渲染组件模拟 `HTML` 元素上的事件成，配合 `Jest` 进行 `DOM` 节点的断言。

如果你正在寻找用于 `React` 端到端 (`E2E`) 测试的测试工具，`Cypress` 是现在最受欢迎的选择。

阅读：

- 《[React 单元测试实践](https://zhuanlan.zhihu.com/p/431143598)》

------

## 数据结构


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a18c694bef4427ba3a70cf664bb944e~tplv-k3u1fbpfcp-zoom-1.image)


`Vanilla JavaScript` 为你提供了大量内置工具来处理数据结构，就好像它们是不可变的一样。但是，如果你觉得需要强制执行不可变数据结构，那么最受欢迎的选择之一是 `Immer` 。我个人没用过它，因为 `JavaScript` 本身就可以用于管理不可变的数据结构，但是如果有人专门问到 `JS` 的不可变性，有人会推荐它。

链接：

- `Immer`：https://github.com/immerjs/immer

阅读：

- 《[immer —— 提高React开发效率的神器](https://zhuanlan.zhihu.com/p/146773995)》

------
## 国际化


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b00a81f8dc7348aabe84eecfcf0fdfa8~tplv-k3u1fbpfcp-zoom-1.image)


当涉及到 `React` 应用程序的国际化 `i18n` 时，你不仅需要考虑翻译，还需要考虑复数、日期和货币的格式以及其他一些事情。这些是处理国际化的最流行的库：

- `FormatJS`：https://github.com/formatjs/formatjs
- `react-i18next`：https://github.com/i18next/react-i18next

------
## 富文本编辑


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9077f8ab74fc4874be300dc40c17f705~tplv-k3u1fbpfcp-zoom-1.image)

`React` 中的富文本编辑器，就简单推荐下面几个，我也没太多用过：

- `Draft.js`：https://draftjs.org/
- `Slate.js`：https://www.slatejs.org/
- `ReactQuill`：https://github.com/zenoamaro/react-quill


------
## 时间处理

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba12c184411d45959f95fddb7cffa094~tplv-k3u1fbpfcp-zoom-1.image)


近年来，`JavaScript` 本身在处理日期和时间方面做了很多优化和努力，所以一般没必要使用专门的库来处理它们。但是，如果你的 `React` 应用程序需要大量处理日期、时间和时区，你可以引入一个库来为你管理这些事情：

- `date-fns`：https://github.com/date-fns/date-fns
- `Day.js`：https://github.com/iamkun/dayjs
- `Luxon`：https://github.com/moment/luxon/

------
## 客户端


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19eb18cabc1d49b3845979c026836408~tplv-k3u1fbpfcp-zoom-1.image)


`Electron` 是现在跨平台桌面应用程序的首选框架。但是，也存在一些替代方案：

- `Tauri`： (当前最新的) https://github.com/tauri-apps/tauri
- `NW.js`：https://nwjs.io/
- `Neutralino.js`：https://github.com/neutralinojs/neutralinojs

阅读：

- 《扔掉 Electron，拥抱基于 Rust 开发的 Tauri》：https://juejin.cn/post/7067342513920540686#comment

------
## 移动端


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e33dc5a9a9fb43bb984b2ce0917c4699~tplv-k3u1fbpfcp-zoom-1.image)


将 `React` 从 `Web` 带到移动设备的首选解决方案仍然是 `React Native`。

阅读：

- 《React Native 新架构》：https://segmentfault.com/a/1190000041182593


------
## VR/AR


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3bbfb27a78594d8380992ef4e1865801~tplv-k3u1fbpfcp-zoom-1.image)


通过 `React`，我们也可以深入研究虚拟现实或增强现实。老实说，这些库我还都没用过，但它们是我在 `React` 中所熟悉的 `AR/VR` 库：

- `react-three-fiber`： (最流行的3D库，其中也有VR实现)https://github.com/pmndrs/react-three-fiber
- `react-360：https://facebook.github.io/react-360/
- `aframe-react`：https://github.com/supermedium/aframe-react

------
## 原型设计


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e32301bf28574450bd282bc2346ea6ce~tplv-k3u1fbpfcp-zoom-1.image)


如果你是一名 `UI/UX` 设计师，你可能希望使用一种工具来为新的 `React` 组件、布局或 `UI/UX` 概念进行快速原型设计。我之前用的是 `Sketch` ，现在改用了 `Figma` 。尽管我两者都喜欢，但我还是更喜欢 `Figma`。`Zeplin` 是另一种选择。对于一些简单的草图，我喜欢使用 `Excalidraw`。如果你正在寻找交互式 `UI/UX` 设计，可以看看 `InVision`。

- `Sketch`：https://www.sketch.com/
- `Figma`：https://www.figma.com/
- `Zeplin`：https://zeplin.io/
- `Excalidraw`：https://excalidraw.com/
- `InVision`：https://www.invisionapp.com/

------
## 文档

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f157713d73d4c97ba034510834d5559~tplv-k3u1fbpfcp-zoom-1.image)

我在很多项目里都在使用 `Storybook` 作为文档工具，不过也有一些其他好的方案：

- `Docusaurus`：https://github.com/facebook/docusaurus
- `Docz`：https://github.com/doczjs/docz
- `Styleguidist`：https://github.com/styleguidist/react-styleguidist

## 最后

参考：https://www.robinwieruch.de/react-libraries/


本文完，欢迎大家补充。


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。


