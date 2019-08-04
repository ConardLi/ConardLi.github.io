---
title: 从Mixin到HOC再到Hook（二）
date: 2019-04-09 23:27:27
tags:
     - React
---

## 高阶组件（HOC）


![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc9.png)


高阶组件可以看作`React`对装饰模式的一种实现，高阶组件就是一个函数，且该函数接受一个组件作为参数，并返回一个新的组件。

> 高阶组件（`HOC`）是`React`中的高级技术，用来重用组件逻辑。但高阶组件本身并不是`React API`。它只是一种模式，这种模式是由`React`自身的组合性质必然产生的。


```js
function visible(WrappedComponent) {
  return class extends Component {
    render() {
      const { visible, ...props } = this.props;
      if (visible === false) return null;
      return <WrappedComponent {...props} />;
    }
  }
}
```
上面的代码就是一个`HOC`的简单应用，函数接收一个组件作为参数，并返回一个新组件，新组建可以接收一个`visible props`，根据`visible`的值来判断是否渲染Visible。

下面我们从以下几方面来具体探索`HOC`。

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc8.png)


## HOC的实现方式


### 属性代理

函数返回一个我们自己定义的组件，然后在`render`中返回要包裹的组件，这样我们就可以代理所有传入的`props`，并且决定如何渲染，实际上 ，这种方式生成的高阶组件就是原组件的父组件，上面的函数`visible`就是一个`HOC`属性代理的实现方式。

```js
function proxyHOC(WrappedComponent) {
  return class extends Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
}
```


对比原生组件增强的项：

- 可操作所有传入的`props`
- 可操作组件的生命周期
- 可操作组件的`static`方法
- 获取`refs`


### 反向继承

返回一个组件，继承原组件，在`render`中调用原组件的`render`。由于继承了原组件，能通过this访问到原组件的`生命周期、props、state、render`等，相比属性代理它能操作更多的属性。

```js
function inheritHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      return super.render();
    }
  }
}
```

对比原生组件增强的项：

- 可操作所有传入的`props`
- 可操作组件的生命周期
- 可操作组件的`static`方法
- 获取`refs`
- 可操作`state `
- 可以渲染劫持




## HOC可以实现什么功能

### 组合渲染

可使用任何其他组件和原组件进行组合渲染，达到样式、布局复用等效果。

> 通过属性代理实现

```js
function stylHOC(WrappedComponent) {
  return class extends Component {
    render() {
      return (<div>
        <div className="title">{this.props.title}</div>
        <WrappedComponent {...this.props} />
      </div>);
    }
  }
}
```

> 通过反向继承实现

```js
function styleHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      return <div>
        <div className="title">{this.props.title}</div>
        {super.render()}
      </div>
    }
  }
}
```

### 条件渲染

根据特定的属性决定原组件是否渲染

> 通过属性代理实现

```js
function visibleHOC(WrappedComponent) {
  return class extends Component {
    render() {
      if (this.props.visible === false) return null;
      return <WrappedComponent {...props} />;
    }
  }
}
```

> 通过反向继承实现

```js
function visibleHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      if (this.props.visible === false) {
        return null
      } else {
        return super.render()
      }
    }
  }
}
```

### 操作props

可以对传入组件的`props`进行增加、修改、删除或者根据特定的`props`进行特殊的操作。

> 通过属性代理实现

```js
function proxyHOC(WrappedComponent) {
  return class extends Component {
    render() {
      const newProps = {
        ...this.props,
        user: 'ConardLi'
      }
      return <WrappedComponent {...newProps} />;
    }
  }
}
```

### 获取refs 

高阶组件中可获取原组件的`ref`，通过`ref`获取组件实力，如下面的代码，当程序初始化完成后调用原组件的log方法。(不知道refs怎么用，请👇[Refs & DOM](https://react.docschina.org/docs/refs-and-the-dom.html))

> 通过属性代理实现

```js
function refHOC(WrappedComponent) {
  return class extends Component {
    componentDidMount() {
      this.wapperRef.log()
    }
    render() {
      return <WrappedComponent {...this.props} ref={ref => { this.wapperRef = ref }} />;
    }
  }
}
```

这里注意：调用高阶组件的时候并不能获取到原组件的真实`ref`，需要手动进行传递，具体请看[传递refs](#传递refs)

### 状态管理

将原组件的状态提取到`HOC`中进行管理，如下面的代码，我们将`Input`的`value`提取到`HOC`中进行管理，使它变成受控组件，同时不影响它使用`onChange`方法进行一些其他操作。基于这种方式，我们可以实现一个简单的`双向绑定`，具体请看[双向绑定](#双向绑定)。

> 通过属性代理实现

```js
function proxyHoc(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = { value: '' };
    }

    onChange = (event) => {
      const { onChange } = this.props;
      this.setState({
        value: event.target.value,
      }, () => {
        if(typeof onChange ==='function'){
          onChange(event);
        }
      })
    }

    render() {
      const newProps = {
        value: this.state.value,
        onChange: this.onChange,
      }
      return <WrappedComponent {...this.props} {...newProps} />;
    }
  }
}

class HOC extends Component {
  render() {
    return <input {...this.props}></input>
  }
}

export default proxyHoc(HOC);
```



### 操作state

上面的例子通过属性代理利用HOC的state对原组件进行了一定的增强，但并不能直接控制原组件的`state`，而通过反向继承，我们可以直接操作原组件的`state`。但是并不推荐直接修改或添加原组件的`state`，因为这样有可能和组件内部的操作构成冲突。

> 通过反向继承实现

```js
function debugHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      console.log('props', this.props);
      console.log('state', this.state);
      return (
        <div className="debuging">
          {super.render()}
        </div>
      )
    }
  }
}
```

上面的`HOC`在`render`中将`props`和`state`打印出来，可以用作调试阶段，当然你可以在里面写更多的调试代码。想象一下，只需要在我们想要调试的组件上加上`@debug`就可以对该组件进行调试，而不需要在每次调试的时候写很多冗余代码。(如果你还不知道怎么使用HOC，请👇[如何使用HOC](#如何使用HOC))


### 渲染劫持

高阶组件可以在render函数中做非常多的操作，从而控制原组件的渲染输出。只要改变了原组件的渲染，我们都将它称之为一种`渲染劫持`。

实际上，上面的[组合渲染](#组合渲染)和[条件渲染](#条件渲染)都是`渲染劫持`的一种，通过反向继承，不仅可以实现以上两点，还可直接`增强`由原组件`render`函数产生的`React元素`。


> 通过反向继承实现

```js
function hijackHOC(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      const tree = super.render();
      let newProps = {};
      if (tree && tree.type === 'input') {
        newProps = { value: '渲染被劫持了' };
      }
      const props = Object.assign({}, tree.props, newProps);
      const newTree = React.cloneElement(tree, props, tree.props.children);
      return newTree;
    }
  }
}
```

注意上面的说明我用的是`增强`而不是`更改`。`render`函数内实际上是调用`React.creatElement`产生的`React元素`：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc1.png)
虽然我们能拿到它，但是我们不能直接修改它里面的属性，我们通过`getOwnPropertyDescriptors`函数来打印下它的配置项：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc2.png)

可以发现，所有的`writable`属性均被配置为了`false`，即所有属性是不可变的。（对这些配置项有疑问，请👇[defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)）

不能直接修改，我们可以借助`cloneElement`方法来在原组件的基础上增强一个新组件：

>` React.cloneElement()`克隆并返回一个新的`React元素`，使用` element `作为起点。生成的元素将会拥有原始元素props与新props的浅合并。新的子级会替换现有的子级。来自原始元素的 key 和 ref 将会保留。

`React.cloneElement() `几乎相当于：

```js
<element.type {...element.props} {...props}>{children}</element.type>
```



## 如何使用HOC

上面的示例代码都写的是如何声明一个`HOC`，`HOC`实际上是一个函数，所以我们将要增强的组件作为参数调用`HOC`函数，得到增强后的组件。

```js
class myComponent extends Component {
  render() {
    return (<span>原组件</span>)
  }
}
export default inheritHOC(myComponent);
```

### compose
 
在实际应用中，一个组件可能被多个`HOC`增强，我们使用的是被所有的`HOC`增强后的组件，借用一张`装饰模式`的图来说明，可能更容易理解：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc3.jpeg)

假设现在我们有`logger`，`visible`，`style`等多个`HOC`，现在要同时增强一个`Input`组件：

```js
logger(visible(style(Input)))
```
这种代码非常的难以阅读，我们可以手动封装一个简单的函数组合工具，将写法改写如下：

```js
const compose = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)));
compose(logger,visible,style)(Input);
```

`compose`函数返回一个所有函数组合后的函数，`compose(f, g, h)` 和 `(...args) => f(g(h(...args)))`是一样的。

很多第三方库都提供了类似`compose`的函数，例如`lodash.flowRight`，`Redux`提供的`combineReducers`函数等。


### Decorators

我们还可以借助`ES7`为我们提供的`Decorators`来让我们的写法变的更加优雅：

```js
@logger
@visible
@style
class Input extends Component {
  // ...
}
```
`Decorators`是`ES7`的一个提案，还没有被标准化，但目前`Babel`转码器已经支持，我们需要提前配置`babel-plugin-transform-decorators-legacy`：

```js
"plugins": ["transform-decorators-legacy"]
```

还可以结合上面的`compose`函数使用：

```js
const hoc = compose(logger, visible, style);
@hoc
class Input extends Component {
  // ...
}
```

文中如有错误，欢迎在评论区指正，谢谢阅读。

