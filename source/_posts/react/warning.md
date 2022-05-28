---
title: 修复 React 代码中烦人的 Warning
category: React
tag:
- React
- 工程实践
date: 2020-12-01
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



## 缺少 Key

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cca6160e6d1b41a7adbb159c30fcf556~tplv-k3u1fbpfcp-zoom-1.image)

react官方文档是这样描述key的：

> Keys可以在DOM中的某些元素被增加或删除的时候帮助React识别哪些元素发生了变化。因此你应当给数组中的每一个元素赋予一个确定的标识。

react的diff算法是把key当成唯一id然后比对组件的value来确定是否需要更新的，所以如果没有key，react将不会知道该如何更新组件。你不传 key 也能用是因为 react 检测到子组件没有 key 后，会默认将数组的索引作为 key。react根据key来决定是销毁重新创建组件还是更新组件，原则是：

- key相同，组件有所变化，react会只更新组件对应变化的属性。
- key不同，组件会销毁之前的组件，将整个组件重新渲染。

## 重复 Key

### warning

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3dca79e7a8ed49499dba5e5cbf3bcf0a~tplv-k3u1fbpfcp-zoom-1.image)

从上面提到的 key 的作用可以知道，如果出现两个相同的 key，则渲染可能出现异常。

### 错误案例：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9aa4a3f0959e40c681e04eff33565a58~tplv-k3u1fbpfcp-zoom-1.image)

常见的错误是，在使用 antd 的 table 组件时，每个列的 dataIndex 属性同时也会作为 key，注意两个列的 dataIndex 不要相同。

## P 标签包含内联元素

### warning

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8402753d85184b968399b93b69831fd8~tplv-k3u1fbpfcp-zoom-1.image)

在 HTML5 中，标准制定者重新定义了HTML元素的分类，并根据这一新的分类定义了元素的内容模型(Content Model) -- 对于一个元素而言，哪些子元素是合法的，而哪些子元素是非法的。需要注意的是，HTML5中的这种元素分类与inline、block没有任何关系，任何元素都可以在CSS中被定义为display:inline或者display:block。另外，除了这7大分类，还存在一些较小的分类，如Palpable、Script-Supporting等。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d408710002cd45bca2e7746039f04191~tplv-k3u1fbpfcp-zoom-1.image)

**Metadata**

顾名思义，Metadata元素意指那些定义文档元数据信息的元素 — 其作用包括：影响文档中其它节点的展现与行为、定义文档与其它外部资源之间的关系等。以下元素属于Metadata：base, link, meta, noscript, script, style, template, title。

**Flow**

所有可以放在body标签内，构成文档内容的元素均属于Flow元素。因此，除了base, link, meta, style, title等只能放在head标签内的元素外，剩下的所有元素均属于Flow元素。

**Sectioning**

Sectioning意指定义页面结构的元素，具体包含以下四个：article, aside, nav, section。

**Heading**

所有标题元素属于Heading，也即以下6个元素：h1, h2, h3, h4, h5, h6。

**Phrasing**

所有可以放在p标签内，构成段落内容的元素均属于Phrasing元素。因此，所有Phrasing元素均属于Flow元素。在HTML5标准文档中，关于Phrasing元素的原始定义为：

> Phrasing content is the text of the document, as well as elements that mark up that text at the intra-paragraph level. Runs of phrasing content form paragraphs.

对于这一定义，个人认为不应当使用“text”这一容易引起误解的词，事实上，一个元素即使不是文本，只要能包含在p标签中成为段落内容的一部分，就可以称之为Phrasing元素。比如：audio、video、img、select、input等元素(经测试，这些元素都可以放置在p标签中)。一个不太精确的类比是：HTML5中的Phrasing元素大致就是HTML4中所定义的inline元素。Phrasing元素内部一般只能包含别的Phrasing元素。

**Embedded**

所有用于在网页中嵌入外部资源的元素均属于Embedded元素，具体包含以下9个：audio, video, img, canvas, svg, iframe, embed, object, math。

**Interactive**

所有与用户交互有关的元素均属于Interactive元素，包括a, input, textarea, select等。

**内容模型(Content Model)**

根据以上元素分类，HTML5标准文档定义了任何元素的内容模型 — 对于该元素而言，何种子元素才是合法的。

对于p元素而言，其内容模型为Phrasing, 这意味着p元素只接受Phrasing元素为子元素，而对于像div这样的非Phrasing元素则并不接受。类似的，li元素的内容模型为Flow，因此任何可以放置在body中的元素都可以作为li元素的子元素。

### 错误案例

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ef5b066aebf42879989fb2321c30fe9~tplv-k3u1fbpfcp-zoom-1.image)

直接写 html 元素时我们可能会有意识的避免 p 标签包含 div，使用 antd 时有些组件可能会不太注意，比如 Divider 是使用 div 实现的，不能作为 p 标签的子元素。

> 页面可能正常解析，但不符合语义。这是因为浏览器自带容错机制，对于不规范的写法也能够正确的解析，各浏览器的容错机制不同，所以尽量按规范来写。

## Props 类型错误

### warning

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/256aace421d7429cad695e22097992ba~tplv-k3u1fbpfcp-zoom-1.image)

组件接收的 props 类型与预定义的不符。

### 错误案例

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/14a207cd55954dbfad4471750e53c651~tplv-k3u1fbpfcp-zoom-1.image)

以上的 case 最容易产生这种 warning，当我们定义了一个高阶组件，此组件是对已有 From 组件的一个封装，同时我们额外接收一个 param 参数来做一个其他事情，其他的参数我们要传回 Form。这时如果不做额外的操作，param 参数也会被传入 Form 组件，它是一个意外的参数，这就会让 React 抛出 warning，我们可以做下面的处理：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d33a4da9d73444486db7c8d292f981b~tplv-k3u1fbpfcp-zoom-1.image)

## componentWillReceiveProps 弃用

### warning

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a308942373c4ed68ed0220f0378b9fa~tplv-k3u1fbpfcp-zoom-1.image)

- componentWillMount
- componentWillReceiveProps
- componentWillUpdate

这些生命周期经常被误解或滥用，它们的潜在滥用可能会对异步渲染造成更大的问题，未来其会被逐渐弃用，现在使用如果没有加 UNSAFE_ 前缀，则会在控制台抛出错误。

React Fiber 引入了异步渲染，有了异步渲染之后，React 组件的渲染过程是分时间片的，不是一口气从头到尾把子组件全部渲染完，而是每个时间片渲染一点，然后每个时间片的间隔都可去看看有没有更紧急的任务（比如用户按键），如果有，就去处理紧急任务，如果没有那就继续照常渲染。

根据 React Fiber 的设计，一个组件的渲染被分为两个阶段：第一个阶段（也叫做 render 阶段）是可以被 React 打断的，一旦被打断，这阶段所做的所有事情都被废弃，当 React 处理完紧急的事情回来，依然会重新渲染这个组件，这时候第一阶段的工作会重做一遍；第二个阶段叫做 commit 阶段，一旦开始就不能中断，也就是说第二个阶段的工作会稳稳当当地做到这个组件的渲染结束。

两个阶段的分界点，就是 render 函数。render 函数之前的所有生命周期函数（包括 render)都属于第一阶段，之后的都属于第二阶段。在 React v16.3 之前，render 之前的生命周期函数（也就是第一阶段生命周期函数）包括这些：

- componentWillReceiveProps
- shouldComponentUpdate
- componentWillUpdate
- componentWillMount
- render

上面提到的滥用，其实就是在这些生命周期中产生了副作用，这些生命周期都应该是纯函数，不应该产生任何副作用。到了 React v16.3，React 干脆引入了一个新的生命周期函数 getDerivedStateFromProps，这个生命周期函数是一个 static 函数，在里面根本不能通过 this 访问到当前组件，输入只能通过参数，对组件渲染的影响只能通过返回值。没错，getDerivedStateFromProps 应该是一个纯函数，React 就是通过要求这种纯函数，强制开发者们必须适应异步渲染。

### 错误案例

已弃用写法：

```js
class ExampleComponent extends React.Component {
    state = {
      isScrollingDown: false,
    };
    componentWillReceiveProps(nextProps) {
      if (this.props.currentRow !== nextProps.currentRow) {
        this.setState({
          isScrollingDown:
            nextProps.currentRow > this.props.currentRow,
        });
      }
    }
  }
```

推荐写法：

```js
class ExampleComponent extends React.Component {
    state = {
      isScrollingDown: false,
      lastRow: null,
    };
    static getDerivedStateFromProps(props, state) {
      if (props.currentRow !== state.lastRow) {
        return {
          isScrollingDown: props.currentRow > state.lastRow,
          lastRow: props.currentRow,
        };
      }
      return null;
    }
  }
```

## getSnapshotBeforeUpdate 无返回值

### warning

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0505ea5cc80b45ed88d557496526384a~tplv-k3u1fbpfcp-zoom-1.image)

如果组件实现了 getSnapshotBeforeUpdate() 生命周期，则它的返回值将作为 componentDidUpdate() 的第三个参数 “snapshot” 参数传递。否则此参数将为 undefined。

> getSnapshotBeforeUpdate() 在最近一次渲染输出（提交到 DOM 节点）之前调用。它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）。此生命周期的任何返回值将作为参数传递给 componentDidUpdate()。此用法并不常见，但它可能出现在 UI 处理中，如需要以特殊方式处理滚动位置的聊天线程等。

### 错误案例

已弃用写法：

```js
componentWillUpdate(nextProps, nextState) {
    if (this.props.list.length < nextProps.list.length) {
      this.previousScrollOffset =
        this.listRef.scrollHeight - this.listRef.scrollTop;
    }
}

componentDidUpdate(prevProps, prevState) {
    if (this.previousScrollOffset !== null) {
      this.listRef.scrollTop =
        this.listRef.scrollHeight -
        this.previousScrollOffset;
      this.previousScrollOffset = null;
    }
}
```

在上面的示例中，componentWillUpdate用于读取DOM属性。但是，使用异步渲染时，“render”阶段生命周期（如componentWillUpdate和render）和“commit”阶段生命周期（如componentDidUpdate）之间可能会有延迟。如果用户在此期间进行了诸如调整窗口大小的操作，则scrollHeight从中读取的值componentWillUpdate将不准确。

正确用法：

```js
getSnapshotBeforeUpdate(prevProps, prevState) {
    if (prevProps.list.length < this.props.list.length) {
      return (
        this.listRef.scrollHeight - this.listRef.scrollTop
      );
    }
    return null;
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.listRef.scrollTop =
        this.listRef.scrollHeight - snapshot;
    }
  }
```

## 误用纯函数 Render

### warning

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d4fbe083d7243a193dddded532bb93b~tplv-k3u1fbpfcp-zoom-1.image)

上面我们提到 render 函数也属于 render 阶段的生命周期，所以它一定也要是纯函数，有时候为了方便我们会在 render 函数中做一些状态更改，这种用法是错误的。

### 错误案例

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ce2f4b606804da59f83fdc0eaf6605c~tplv-k3u1fbpfcp-zoom-1.image)

上面的案例中，在 render 中根据 hash 值对状态做了更改，正确的用法是这种操作应该在状态初始化时完成，而不是在 render 函数中。

## react hot loader

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae93e903f7254bacbb15e336b6a8f941~tplv-k3u1fbpfcp-zoom-1.image)

这个是 react-hot-loader 的一个 bug，react-hot-loader react-dom 补丁对其进行了修复 https://www.npmjs.com/package/react-hot-loader#hot-loaderreact-dom

安装 @hot-loader/react-dom ，在 webpack 配置中通过 alias 将 @hot-loader/react-dom 指向 react-dom 即可。

## 【Mobx】observableArray

### warning

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d9eaf8df4414fac994e482be6f84cc4~tplv-k3u1fbpfcp-zoom-1.image)

不同于 sort 和 reverse 函数的内置实现，observableArray.sort 和 observableArray.reverse 不会改变数组本身，而只是返回一个排序过/反转过的拷贝。在 MobX 5 及以上版本中会出现警告。推荐使用 array.slice().sort() 来替代。

### 错误案例

```js
store.data.sort((a, b) => a.status - b.status);
```

上面的代码不会直接改变 array，推荐下面的写法：

```js
store.data = store.data.slice().sort((a, b) => a.status - b.status);
```


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
