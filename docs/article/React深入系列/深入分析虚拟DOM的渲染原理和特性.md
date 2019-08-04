---
title: 深入分析虚拟DOM的渲染原理和特性
date: 2019-04-17 11:15:27
tags:
     - React
---



![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/react11.png)

## 导读



`React`的虚拟`DOM`和`Diff`算法是`React`的非常重要的核心特性，这部分源码也非常复杂，理解这部分知识的原理对更深入的掌握`React`是非常必要的。

本来想将虚拟`DOM`和`Diff`算法放到一篇文章，写完虚拟`DOM`发现文章已经很长了，所以本篇只分析虚拟`DOM`。

本篇文章从源码出发，分析虚拟`DOM`的核心渲染原理（首次渲染），以及`React`对它做的性能优化点。

说实话`React`源码真的很难读😅，如果本篇文章帮助到了你，那么请给个赞👍支持一下吧。

## 开发中的常见问题

- 为何必须引用`React`
- 自定义的`React`组件为何必须大写
- `React`如何防止`XSS`
- `React`的`Diff`算法和其他的`Diff`算法有何区别
- `key`在`React`中的作用
- 如何写出高性能的`React`组件

如果你对上面几个问题还存在疑问，说明你对`React`的虚拟`DOM`以及`Diff`算法实现原理还有所欠缺，那么请好好阅读本篇文章吧。

首先我们来看看到底什么是虚拟`DOM`:

## 虚拟DOM

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/虚拟dom.png)

在原生的`JavaScript`程序中，我们直接对`DOM`进行创建和更改，而`DOM`元素通过我们监听的事件和我们的应用程序进行通讯。

而`React`会先将你的代码转换成一个`JavaScript`对象，然后这个`JavaScript`对象再转换成真实`DOM`。这个`JavaScript`对象就是所谓的虚拟`DOM`。

比如下面一段`html`代码：

```html
<div class="title">
      <span>Hello ConardLi</span>
      <ul>
        <li>苹果</li>
        <li>橘子</li>
      </ul>
</div>
```

在`React`可能存储为这样的`JS`代码：

```js

const VitrualDom = {
  type: 'div',
  props: { class: 'title' },
  children: [
    {
      type: 'span',
      children: 'Hello ConardLi'
    },
    {
      type: 'ul',
      children: [
        { type: 'ul', children: '苹果' },
        { type: 'ul', children: '橘子' }
      ]
    }
  ]
}
```

当我们需要创建或更新元素时，`React`首先会让这个`VitrualDom`对象进行创建和更改，然后再将`VitrualDom`对象渲染成真实`DOM`；

当我们需要对`DOM`进行事件监听时，首先对`VitrualDom`进行事件监听，`VitrualDom`会代理原生的`DOM`事件从而做出响应。


## 为何使用虚拟DOM

`React`为何采用`VitrualDom`这种方案呢？

### 提高开发效率

使用`JavaScript`，我们在编写应用程序时的关注点在于如何更新`DOM`。

使用`React`，你只需要告诉`React`你想让视图处于什么状态，`React`则通过`VitrualDom`确保`DOM`与该状态相匹配。你不必自己去完成属性操作、事件处理、`DOM`更新，`React`会替你完成这一切。

这让我们更关注我们的业务逻辑而非`DOM`操作，这一点即可大大提升我们的开发效率。

### 关于提升性能


很多文章说`VitrualDom`可以提升性能，这一说法实际上是很片面的。

直接操作`DOM`是非常耗费性能的，这一点毋庸置疑。但是`React`使用`VitrualDom`也是无法避免操作`DOM`的。

如果是首次渲染，`VitrualDom`不具有任何优势，甚至它要进行更多的计算，消耗更多的内存。

`VitrualDom`的优势在于`React`的`Diff`算法和批处理策略，`React`在页面更新之前，提前计算好了如何进行更新和渲染`DOM`。实际上，这个计算过程我们在直接操作`DOM`时，也是可以自己判断和实现的，但是一定会耗费非常多的精力和时间，而且往往我们自己做的是不如`React`好的。所以，在这个过程中`React`帮助我们"提升了性能"。

所以，我更倾向于说，`VitrualDom`帮助我们提高了开发效率，在重复渲染时它帮助我们计算如何更高效的更新，而不是它比`DOM`操作更快。

如果您对本部分的分析有什么不同见解，欢迎在评论区拍砖。


### 跨浏览器兼容

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/diff3.jpg)



`React`基于`VitrualDom`自己实现了一套自己的事件机制，自己模拟了事件冒泡和捕获的过程，采用了事件代理，批量更新等方法，抹平了各个浏览器的事件兼容性问题。

### 跨平台兼容

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/rn.png)


`VitrualDom`为`React`带来了跨平台渲染的能力。以`React Native`为例子。`React`根据`VitrualDom`画出相应平台的`ui`层，只不过不同平台画的姿势不同而已。


## 虚拟DOM实现原理

如果你不想看繁杂的源码，或者现在没有足够时间，可以跳过这一章，直接👇[虚拟DOM原理总结](#虚拟DOM原理、特性总结)

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/虚拟dom2.png)

在上面的图上我们继续进行扩展，按照图中的流程，我们依次来分析虚拟`DOM`的实现原理。

### JSX和createElement

我们在实现一个`React`组件时可以选择两种编码方式，第一种是使用`JSX`编写：

```js
class Hello extends Component {
  render() {
    return <div>Hello ConardLi</div>;
  }
}
```

第二种是直接使用`React.createElement`编写：

```js
class Hello extends Component {
  render() {
    return React.createElement('div', null, `Hello ConardLi`);
  }
}
```

实际上，上面两种写法是等价的，`JSX`只是为 `React.createElement(component, props, ...children) `方法提供的语法糖。也就是说所有的`JSX `代码最后都会转换成`React.createElement(...) `，`Babel`帮助我们完成了这个转换的过程。

如下面的`JSX`

```js
<div>
  <img src="avatar.png" className="profile" />
  <Hello />
</div>;
```
将会被`Babel`转换为
```js
React.createElement("div", null, React.createElement("img", {
  src: "avatar.png",
  className: "profile"
}), React.createElement(Hello, null));
```
注意，`babel`在编译时会判断`JSX`中组件的首字母，当首字母为小写时，其被认定为原生`DOM`标签，`createElement`的第一个变量被编译为字符串；当首字母为大写时，其被认定为自定义组件，`createElement`的第一个变量被编译为对象；

另外，由于`JSX`提前要被`Babel`编译，所以`JSX`是不能在运行时动态选择类型的，比如下面的代码：

```js
function Story(props) {
  // Wrong! JSX type can't be an expression.
  return <components[props.storyType] story={props.story} />;
}
```
需要变成下面的写法：

```js
function Story(props) {
  // Correct! JSX type can be a capitalized variable.
  const SpecificStory = components[props.storyType];
  return <SpecificStory story={props.story} />;
}
```

所以，使用`JSX`你需要安装`Babel`插件`babel-plugin-transform-react-jsx`

```js
{
    "plugins": [
        ["transform-react-jsx", {
            "pragma": "React.createElement"
        }]
    ]
}
```

### 创建虚拟DOM

下面我们来看看虚拟`DOM`的真实模样，将下面的`JSX`代码在控制台打印出来：

```html
<div className="title">
      <span>Hello ConardLi</span>
      <ul>
        <li>苹果</li>
        <li>橘子</li>
      </ul>
</div>
```
![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/diff2.png)

这个结构和我们上面自己描绘的结构很像，那么`React`是如何将我们的代码转换成这个结构的呢，下面我们来看看`createElement`函数的具体实现（文中的源码经过精简）。

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom1.png)

`createElement`函数内部做的操作很简单，将`props`和子元素进行处理后返回一个`ReactElement`对象，下面我们来逐一分析：

**(1).处理props：**

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom2.png)

- 1.将特殊属性`ref`、`key`从`config`中取出并赋值
- 2.将特殊属性`self`、`source`从`config`中取出并赋值
- 3.将除特殊属性的其他属性取出并赋值给`props`

后面的文章会详细介绍这些特殊属性的作用。

**(2).获取子元素**

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom3.png)

- 1.获取子元素的个数 —— 第二个参数后面的所有参数
- 2.若只有一个子元素，赋值给`props.children`
- 3.若有多个子元素，将子元素填充为一个数组赋值给`props.children`

**(3).处理默认props**

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom4.png)

- 将组件的静态属性`defaultProps`定义的默认`props`进行赋值

**ReactElement**

`ReactElement`将传入的几个属性进行组合，并返回。

- `type`：元素的类型，可以是原生html类型（字符串），或者自定义组件（函数或`class`）
- `key`：组件的唯一标识，用于`Diff`算法，下面会详细介绍
- `ref`：用于访问原生`dom`节点
- `props`：传入组件的`props`
- `owner`：当前正在构建的`Component`所属的`Component`

`$$typeof`：一个我们不常见到的属性，它被赋值为`REACT_ELEMENT_TYPE`：

```js
var REACT_ELEMENT_TYPE =
  (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) ||
  0xeac7;
```

可见，`$$typeof`是一个`Symbol`类型的变量，这个变量可以防止`XSS`。

如果你的服务器有一个漏洞，允许用户存储任意`JSON`对象， 而客户端代码需要一个字符串，这可能会成为一个问题：
```js
// JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* put your exploit here */'
    },
  },
};
let message = { text: expectedTextButGotJSON };
<p>
  {message.text}
</p>
```
`JSON`中不能存储`Symbol`类型的变量。

`ReactElement.isValidElement`函数用来判断一个`React`组件是否是有效的，下面是它的具体实现。

```js
ReactElement.isValidElement = function (object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
};
```
可见`React`渲染时会把没有`$$typeof`标识，以及规则校验不通过的组件过滤掉。

当你的环境不支持`Symbol`时，`$$typeof`被赋值为`0xeac7`，至于为什么，`React`开发者给出了答案：

> `0xeac7`看起来有点像`React`。

`self`、`source`只有在非生产环境才会被加入对象中。

- `self`指定当前位于哪个组件实例。
- `_source`指定调试代码来自的文件(`fileName`)和代码行数(`lineNumber`)。

### 虚拟DOM转换为真实DOM

上面我们分析了代码转换成了虚拟`DOM`的过程，下面来看一下`React`如何将虚拟`DOM`转换成真实`DOM`。

本部分逻辑较复杂，我们先用流程图梳理一下整个过程，整个过程大概可分为四步：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/diff4.png)


**过程1：初始参数处理**

在编写好我们的`React`组件后，我们需要调用`ReactDOM.render(element, container[, callback])`将组件进行渲染。

`render`函数内部实际调用了`_renderSubtreeIntoContainer`，我们来看看它的具体实现：

```js
  render: function (nextElement, container, callback) {
    return ReactMount._renderSubtreeIntoContainer(null, nextElement, container, callback);
  },
```
![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom6.png)

- 1.将当前组件使用`TopLevelWrapper`进行包裹

`TopLevelWrapper`只一个空壳，它为你需要挂载的组件提供了一个`rootID`属性，并在`render`函数中返回该组件。

```js
TopLevelWrapper.prototype.render = function () {
  return this.props.child;
};
```

`ReactDOM.render`函数的第一个参数可以是原生`DOM`也可以是`React`组件，包裹一层`TopLevelWrapper`可以在后面的渲染中将它们进行统一处理，而不用关心是否原生。

- 2.判断根结点下是否已经渲染过元素，如果已经渲染过，判断执行更新或者卸载操作
- 3.处理`shouldReuseMarkup`变量，该变量表示是否需要重新标记元素
- 4.调用将上面处理好的参数传入`_renderNewRootComponent`，渲染完成后调用`callback`。

在`_renderNewRootComponent`中调用`instantiateReactComponent`对我们传入的组件进行分类包装：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom7.png)

根据组件的类型，`React`根据原组件创建了下面四大类组件，对组件进行分类渲染：

- `ReactDOMEmptyComponent`:空组件
- `ReactDOMTextComponent`:文本
- `ReactDOMComponent`:原生`DOM`
- `ReactCompositeComponent`:自定义`React`组件

他们都具备以下三个方法：

- `construct`:用来接收`ReactElement`进行初始化。
- `mountComponent`:用来生成`ReactElement`对应的真实`DOM`或`DOMLazyTree`。
- `unmountComponent`:卸载`DOM`节点，解绑事件。

具体是如何渲染我们在过程3中进行分析。

**过程2：批处理、事务调用**

在`_renderNewRootComponent`中使用`ReactUpdates.batchedUpdates`调用`batchedMountComponentIntoNode`进行批处理。

```js
ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, componentInstance, container, shouldReuseMarkup, context);
```

在`batchedMountComponentIntoNode`中，使用`transaction.perform`调用`mountComponentIntoNode`让其基于事务机制进行调用。

```js
 transaction.perform(mountComponentIntoNode, null, componentInstance, container, transaction, shouldReuseMarkup, context);
```

关于批处理事务，在我前面的分析[setState执行机制](https://juejin.im/post/5c71050ef265da2db27938b5)中有更多介绍。

**过程3：生成html**

在`mountComponentIntoNode`函数中调用`ReactReconciler.mountComponent`生成原生`DOM`节点。

`mountComponent`内部实际上是调用了过程1生成的四种对象的`mountComponent`方法。首先来看一下`ReactDOMComponent`：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/diff5.png)

- 1.对特殊`DOM`标签、`props`进行处理。
- 2.根据标签类型创建`DOM`节点。
- 3.调用`_updateDOMProperties`将`props`插入到`DOM`节点，`_updateDOMProperties`也可用于`props Diff`，第一个参数为上次渲染的`props`，第二个参数为当前`props`，若第一个参数为空，则为首次创建。
- 4.生成一个`DOMLazyTree`对象并调用`_createInitialChildren`将孩子节点渲染到上面。

那么为什么不直接生成一个`DOM`节点而是要创建一个`DOMLazyTree`呢？我们先来看看`_createInitialChildren`做了什么：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom9.png)

判断当前节点的`dangerouslySetInnerHTML`属性、孩子节点是否为文本和其他节点分别调用`DOMLazyTree`的`queueHTML`、`queueText`、`queueChild`。


![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom10.png)

可以发现：`DOMLazyTree`实际上是一个包裹对象，`node`属性中存储了真实的`DOM`节点，`children`、`html`、`text`分别存储孩子、html节点和文本节点。

它提供了几个方法用于插入孩子、`html`以及文本节点，这些插入都是有条件限制的，当`enableLazy`属性为`true`时，这些孩子、`html`以及文本节点会被插入到`DOMLazyTree`对象中，当其为`false`时会插入到真实`DOM`节点中。

```js
var enableLazy = typeof document !== 'undefined' &&
  typeof document.documentMode === 'number' ||
  typeof navigator !== 'undefined' &&
  typeof navigator.userAgent === 'string' &&
  /\bEdge\/\d/.test(navigator.userAgent);
```

可见：`enableLazy`是一个变量，当前浏览器是`IE`或`Edge`时为`true`。

在`IE（8-11）`和`Edge`浏览器中，一个一个插入无子孙的节点，效率要远高于插入一整个序列化完整的节点树。

所以`lazyTree`主要解决的是在`IE（8-11）`和`Edge`浏览器中插入节点的效率问题，在后面的过程4我们会分析到：若当前是`IE`或`Edge`，则需要递归插入`DOMLazyTree`中缓存的子节点，其他浏览器只需要插入一次当前节点，因为他们的孩子已经被渲染好了，而不用担心效率问题。

下面来看一下`ReactCompositeComponent`，由于代码非常多这里就不再贴这个模块的代码，其内部主要做了以下几步：

- 处理`props`、`contex`等变量，调用构造函数创建组件实例
- 判断是否为无状态组件，处理`state`
- 调用`performInitialMount`生命周期，处理子节点，获取`markup`。
- 调用`componentDidMount`生命周期

在`performInitialMount`函数中，首先调用了`componentWillMount`生命周期，由于自定义的`React`组件并不是一个真实的DOM，所以在函数中又调用了孩子节点的`mountComponent`。这也是一个递归的过程，当所有孩子节点渲染完成后，返回`markup`并调用`componentDidMount`。

**过程4：渲染html**

在`mountComponentIntoNode`函数中调用将上一步生成的`markup`插入`container`容器。

在首次渲染时，`_mountImageIntoNode`会清空`container`的子节点后调用`DOMLazyTree.insertTreeBefore`：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom5.png)


判断是否为`fragment`节点或者`<object>`插件：

- 如果是以上两种，首先调用`insertTreeChildren`将此节点的孩子节点渲染到当前节点上，再将渲染完的节点插入到`html`

- 如果是其他节点，先将节点插入到插入到`html`，再调用`insertTreeChildren`将孩子节点插入到`html`。

- 若当前不是`IE`或`Edge`，则不需要再递归插入子节点，只需要插入一次当前节点。


![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/vdom8.png)


- 判断不是`IE`或`bEdge`时`return`
- 若`children`不为空，递归`insertTreeBefore`进行插入
- 渲染html节点
- 渲染文本节点

### 原生DOM事件代理

有关虚拟`DOM`的事件机制，我曾专门写过一篇文章，有兴趣可以👇[【React深入】React事件机制](https://juejin.im/post/5c7df2e7f265da2d8a55d49d)

## 虚拟DOM原理、特性总结

### React组件的渲染流程

- 使用`React.createElement`或`JSX`编写`React`组件，实际上所有的`JSX `代码最后都会转换成`React.createElement(...) `，`Babel`帮助我们完成了这个转换的过程。

- `createElement`函数对`key`和`ref`等特殊的`props`进行处理，并获取`defaultProps`对默认`props`进行赋值，并且对传入的孩子节点进行处理，最终构造成一个`ReactElement`对象（所谓的虚拟`DOM`）。

- `ReactDOM.render`将生成好的虚拟`DOM`渲染到指定容器上，其中采用了批处理、事务等机制并且对特定浏览器进行了性能优化，最终转换为真实`DOM`。

### 虚拟DOM的组成

即`ReactElement`element对象，我们的组件最终会被渲染成下面的结构：

- `type`：元素的类型，可以是原生html类型（字符串），或者自定义组件（函数或`class`）
- `key`：组件的唯一标识，用于`Diff`算法，下面会详细介绍
- `ref`：用于访问原生`dom`节点
- `props`：传入组件的`props`，`chidren`是`props`中的一个属性，它存储了当前组件的孩子节点，可以是数组（多个孩子节点）或对象（只有一个孩子节点）
- `owner`：当前正在构建的`Component`所属的`Component`
- `self`：（非生产环境）指定当前位于哪个组件实例
- `_source`：（非生产环境）指定调试代码来自的文件(`fileName`)和代码行数(`lineNumber`)


### 防止XSS

`ReactElement`对象还有一个`$$typeof`属性，它是一个`Symbol`类型的变量`Symbol.for('react.element')`，当环境不支持`Symbol`时，`$$typeof`被赋值为`0xeac7`。

这个变量可以防止`XSS`。如果你的服务器有一个漏洞，允许用户存储任意`JSON`对象， 而客户端代码需要一个字符串，这可能为你的应用程序带来风险。`JSON`中不能存储`Symbol`类型的变量，而`React`渲染时会把没有`$$typeof`标识的组件过滤掉。

### 批处理和事务

`React`在渲染虚拟`DOM`时应用了批处理以及事务机制，以提高渲染性能。

关于批处理以及事务机制，在我之前的文章[【React深入】setState的执行机制](https://juejin.im/post/5c71050ef265da2db27938b5)中有详细介绍。

### 针对性的性能优化

在`IE（8-11）`和`Edge`浏览器中，一个一个插入无子孙的节点，效率要远高于插入一整个序列化完整的节点树。

`React`通过`lazyTree`，在`IE（8-11）`和`Edge`中进行单个节点依次渲染节点，而在其他浏览器中则首先将整个大的`DOM`结构构建好，然后再整体插入容器。

并且，在单独渲染节点时，`React`还考虑了`fragment`等特殊节点，这些节点则不会一个一个插入渲染。

### 虚拟DOM事件机制

`React`自己实现了一套事件机制，其将所有绑定在虚拟`DOM`上的事件映射到真正的`DOM`事件，并将所有的事件都代理到`document`上，自己模拟了事件冒泡和捕获的过程，并且进行统一的事件分发。

`React`自己构造了合成事件对象`SyntheticEvent`，这是一个跨浏览器原生事件包装器。 它具有与浏览器原生事件相同的接口，包括`stopPropagation() `和` preventDefault() `等等，在所有浏览器中他们工作方式都相同。这抹平了各个浏览器的事件兼容性问题。

上面只分析虚拟`DOM`首次渲染的原理和过程，当然这并不包括虚拟 `DOM`进行 `Diff`的过程，下一篇文章我们再来详细探讨。

关于开篇提的几个问题，我们在下篇文章中进行统一回答。

## 末尾

文中如有错误，欢迎在评论区指正，或者您对文章的排版，阅读体验有什么好的建议，欢迎在评论区指出，谢谢阅读。

想阅读更多优质文章、下载文章中思维导图源文件、阅读文中`demo`源码、可关注我的[github博客](https://github.com/ConardLi/ConardLi.github.io)，你的star✨、点赞和关注是我持续创作的动力！


