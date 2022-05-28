---
title: 从 Mixin 到 HOC 再到 Hook
category: React
tag:
- React
- 工程实践
- 技术原理
- 状态管理
date: 2019-04-09
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


前端发展速度非常之快，页面和组件变得越来越复杂，如何更好的实现`状态逻辑复用`一直都是应用程序中重要的一部分，这直接关系着应用程序的质量以及维护的难易程度。

本文介绍了`React`采用的三种实现`状态逻辑复用`的技术，并分析了他们的实现原理、使用方法、实际应用以及如何选择使用他们。

本文略长，下面是本文的思维导图，您可以从头开始阅读，也可以选择感兴趣的部分阅读：

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a93f73ff19e~tplv-t2oaga2asx-image.image)


## Mixin设计模式

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a93f7719481~tplv-t2oaga2asx-image.image)

`Mixin`（混入）是一种通过扩展收集功能的方式，它本质上是将一个对象的属性拷贝到另一个对象上面去，不过你可以拷贝`任意多`个对象的`任意个`方法到一个新对象上去，这是`继承`所不能实现的。它的出现主要就是为了解决代码复用问题。

很多开源库提供了`Mixin`的实现，如`Underscore`的`_.extend`方法、`JQuery`的`extend`方法。

使用`_.extend`方法实现代码复用：

```js
var LogMixin = {
  actionLog: function() {
    console.log('action...');
  },
  requestLog: function() {
    console.log('request...');
  },
};
function User() {  /*..*/  }
function Goods() {  /*..*/ }
_.extend(User.prototype, LogMixin);
_.extend(Goods.prototype, LogMixin);
var user = new User();
var good = new Goods();
user.actionLog();
good.requestLog();
```

我们可以尝试手动写一个简单的`Mixin`方法：

```js
function setMixin(target, mixin) {
  if (arguments[2]) {
    for (var i = 2, len = arguments.length; i < len; i++) {
      target.prototype[arguments[i]] = mixin.prototype[arguments[i]];
    }
  }
  else {
    for (var methodName in mixin.prototype) {
      if (!Object.hasOwnProperty(target.prototype, methodName)) {
        target.prototype[methodName] = mixin.prototype[methodName];
      }
    }
  }
}
setMixin(User,LogMixin,'actionLog');
setMixin(Goods,LogMixin,'requestLog');
```

您可以使用`setMixin`方法将任意对象的任意方法扩展到目标对象上。

## React中应用Mixin

`React`也提供了`Mixin`的实现，如果完全不同的组件有相似的功能，我们可以引入来实现代码复用，当然只有在使用`createClass`来创建`React`组件时才可以使用，因为在`React`组件的`es6`写法中它已经被废弃掉了。

例如下面的例子，很多组件或页面都需要记录用户行为，性能指标等。如果我们在每个组件都引入写日志的逻辑，会产生大量重复代码，通过`Mixin`我们可以解决这一问题：

```js
var LogMixin = {
  log: function() {
    console.log('log');
  },
  componentDidMount: function() {
    console.log('in');
  },
  componentWillUnmount: function() {
    console.log('out');
  }
};

var User = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});

var Goods = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});
```

## Mixin带来的危害

`React`官方文档在[Mixins Considered Harmful](https://react.docschina.org/blog/2016/07/13/mixins-considered-harmful.html)一文中提到了`Mixin`带来了危害：

- `Mixin` 可能会相互依赖，相互耦合，不利于代码维护
- 不同的` Mixin `中的方法可能会相互冲突
- `Mixin`非常多时，组件是可以感知到的，甚至还要为其做相关处理，这样会给代码造成滚雪球式的复杂性

`React`现在已经不再推荐使用`Mixin`来解决代码复用问题，因为`Mixin`带来的危害比他产生的价值还要巨大，并且`React`全面推荐使用高阶组件来替代它。另外，高阶组件还能实现更多其他更强大的功能，在学习高阶组件之前，我们先来看一个设计模式。

## 装饰模式
![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a93f7d6879a~tplv-t2oaga2asx-image.image)

装饰者(`decorator`)模式能够在不改变对象自身的基础上，在程序运行期间给对像动态的添加职责。与继承相比，装饰者是一种更轻便灵活的做法。



## 高阶组件（HOC）


![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a93f959e716~tplv-t2oaga2asx-image.image)


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

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a93f9a729dc~tplv-t2oaga2asx-image.image)


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

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a93fa0c3651~tplv-t2oaga2asx-image.image)
虽然我们能拿到它，但是我们不能直接修改它里面的属性，我们通过`getOwnPropertyDescriptors`函数来打印下它的配置项：

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a947a775967~tplv-t2oaga2asx-image.image)

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

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a949cfeb119~tplv-t2oaga2asx-image.image)

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


## HOC的实际应用

下面是一些我在生产环境中实际对`HOC`的实际应用场景，由于文章篇幅原因，代码经过很多简化，如有问题欢迎在评论区指出：

### 日志打点

实际上这属于一类最常见的应用，多个组件拥有类似的逻辑，我们要对重复的逻辑进行复用，
官方文档中`CommentList`的示例也是解决了代码复用问题，写的很详细，有兴趣可以👇[使用高阶组件（HOC）解决横切关注点](https://react.docschina.org/docs/higher-order-components.html#%E4%BD%BF%E7%94%A8%E9%AB%98%E9%98%B6%E7%BB%84%E4%BB%B6%EF%BC%88hoc%EF%BC%89%E8%A7%A3%E5%86%B3%E6%A8%AA%E5%88%87%E5%85%B3%E6%B3%A8%E7%82%B9)。

某些页面需要记录用户行为，性能指标等等，通过高阶组件做这些事情可以省去很多重复代码。

```js
function logHoc(WrappedComponent) {
  return class extends Component {
    componentWillMount() {
      this.start = Date.now();
    }
    componentDidMount() {
      this.end = Date.now();
      console.log(`${WrappedComponent.dispalyName} 渲染时间：${this.end - this.start} ms`);
      console.log(`${user}进入${WrappedComponent.dispalyName}`);
    }
    componentWillUnmount() {
      console.log(`${user}退出${WrappedComponent.dispalyName}`);
    }
    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}
```

### 可用、权限控制

```js
function auth(WrappedComponent) {
  return class extends Component {
    render() {
      const { visible, auth, display = null, ...props } = this.props;
      if (visible === false || (auth && authList.indexOf(auth) === -1)) {
        return display
      }
      return <WrappedComponent {...props} />;
    }
  }
}
```
`authList`是我们在进入程序时向后端请求的所有权限列表，当组件所需要的权限不列表中，或者设置的
`visible`是`false`，我们将其显示为传入的组件样式，或者`null`。我们可以将任何需要进行权限校验的组件应用`HOC`：

```js
  @auth
  class Input extends Component {  ...  }
  @auth
  class Button extends Component {  ...  }

  <Button auth="user/addUser">添加用户</Button>
  <Input auth="user/search" visible={false} >添加用户</Input>
```




### 双向绑定

在`vue`中，绑定一个变量后可实现双向数据绑定，即表单中的值改变后绑定的变量也会自动改变。而`React`中没有做这样的处理，在默认情况下，表单元素都是`非受控组件`。给表单元素绑定一个状态后，往往需要手动书写`onChange`方法来将其改写为`受控组件`，在表单元素非常多的情况下这些重复操作是非常痛苦的。

我们可以借助高阶组件来实现一个简单的双向绑定，代码略长，可以结合下面的思维导图进行理解。

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a94a5328c3b~tplv-t2oaga2asx-image.image)

首先我们自定义一个`Form`组件，该组件用于包裹所有需要包裹的表单组件，通过`contex`向子组件暴露两个属性：

- `model`：当前`Form`管控的所有数据，由表单`name`和`value`组成，如`{name:'ConardLi',pwd:'123'}`。`model`可由外部传入，也可自行管控。
- `changeModel`：改变`model`中某个`name`的值。

```js

class Form extends Component {
  static childContextTypes = {
    model: PropTypes.object,
    changeModel: PropTypes.func
  }
  constructor(props, context) {
    super(props, context);
    this.state = {
      model: props.model || {}
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.model) {
      this.setState({
        model: nextProps.model
      })
    }
  }
  changeModel = (name, value) => {
    this.setState({
      model: { ...this.state.model, [name]: value }
    })
  }
  getChildContext() {
    return {
      changeModel: this.changeModel,
      model: this.props.model || this.state.model
    };
  }
  onSubmit = () => {
    console.log(this.state.model);
  }
  render() {
    return <div>
      {this.props.children}
      <button onClick={this.onSubmit}>提交</button>
    </div>
  }
}
```

下面定义用于双向绑定的`HOC`，其代理了表单的`onChange`属性和`value`属性：

- 发生`onChange`事件时调用上层`Form`的`changeModel`方法来改变`context`中的`model`。
- 在渲染时将`value`改为从`context`中取出的值。

```js
function proxyHoc(WrappedComponent) {
  return class extends Component {
    static contextTypes = {
      model: PropTypes.object,
      changeModel: PropTypes.func
    }

    onChange = (event) => {
      const { changeModel } = this.context;
      const { onChange } = this.props;
      const { v_model } = this.props;
      changeModel(v_model, event.target.value);
      if(typeof onChange === 'function'){onChange(event);}
    }

    render() {
      const { model } = this.context;
      const { v_model } = this.props;
      return <WrappedComponent
        {...this.props}
        value={model[v_model]}
        onChange={this.onChange}
      />;
    }
  }
}
@proxyHoc
class Input extends Component {
  render() {
    return <input {...this.props}></input>
  }
}
```
上面的代码只是简略的一部分，除了`input`，我们还可以将`HOC`应用在`select`等其他表单组件，甚至还可以将上面的`HOC`兼容到`span、table`等展示组件，这样做可以大大简化代码，让我们省去了很多状态管理的工作，使用如下：

```js
export default class extends Component {
  render() {
    return (
      <Form >
        <Input v_model="name"></Input>
        <Input v_model="pwd"></Input>
      </Form>
    )
  }
}
```

### 表单校验

基于上面的双向绑定的例子，我们再来一个表单验证器，表单验证器可以包含验证函数以及提示信息，当验证不通过时，展示错误信息：

```js
function validateHoc(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = { error: '' }
    }
    onChange = (event) => {
      const { validator } = this.props;
      if (validator && typeof validator.func === 'function') {
        if (!validator.func(event.target.value)) {
          this.setState({ error: validator.msg })
        } else {
          this.setState({ error: '' })
        }
      }
    }
    render() {
      return <div>
        <WrappedComponent onChange={this.onChange}  {...this.props} />
        <div>{this.state.error || ''}</div>
      </div>
    }
  }
}
```

```js
const validatorName = {
  func: (val) => val && !isNaN(val),
  msg: '请输入数字'
}
const validatorPwd = {
  func: (val) => val && val.length > 6,
  msg: '密码必须大于6位'
}
<HOCInput validator={validatorName} v_model="name"></HOCInput>
<HOCInput validator={validatorPwd} v_model="pwd"></HOCInput>
```

当然，还可以在`Form`提交的时候判断所有验证器是否通过，验证器也可以设置为数组等等，由于文章篇幅原因，代码被简化了很多，有兴趣的同学可以自己实现。


## Redux的connect


![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a94af19db54~tplv-t2oaga2asx-image.image)


redux中的`connect`，其实就是一个`HOC`，下面就是一个简化版的`connect`实现：

```js
export const connect = (mapStateToProps, mapDispatchToProps) => (WrappedComponent) => {
  class Connect extends Component {
    static contextTypes = {
      store: PropTypes.object
    }

    constructor () {
      super()
      this.state = {
        allProps: {}
      }
    }

    componentWillMount () {
      const { store } = this.context
      this._updateProps()
      store.subscribe(() => this._updateProps())
    }

    _updateProps () {
      const { store } = this.context
      let stateProps = mapStateToProps ? mapStateToProps(store.getState(), this.props): {} 
      let dispatchProps = mapDispatchToProps? mapDispatchToProps(store.dispatch, this.props) : {} 
      this.setState({
        allProps: {
          ...stateProps,
          ...dispatchProps,
          ...this.props
        }
      })
    }

    render () {
      return <WrappedComponent {...this.state.allProps} />
    }
  }
  return Connect
}
```

代码非常清晰，`connect`函数其实就做了一件事，将`mapStateToProps`和`mapDispatchToProps`分别解构后传给原组件，这样我们在原组件内就可以直接用`props`获取`state`以及`dispatch`函数了。


## 使用HOC的注意事项

### 告诫—静态属性拷贝

当我们应用`HOC`去增强另一个组件时，我们实际使用的组件已经不是原组件了，所以我们拿不到原组件的任何静态属性，我们可以在`HOC`的结尾手动拷贝他们：

```js
function proxyHOC(WrappedComponent) {
  class HOCComponent extends Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  HOCComponent.staticMethod = WrappedComponent.staticMethod;
  // ... 
  return HOCComponent;
}
```

如果原组件有非常多的静态属性，这个过程是非常痛苦的，而且你需要去了解需要增强的所有组件的静态属性是什么，我们可以使用[`hoist-non-react-statics`](https://github.com/mridgway/hoist-non-react-statics)来帮助我们解决这个问题，它可以自动帮我们拷贝所有非`React`的静态方法，使用方式如下：

```js
import hoistNonReactStatic from 'hoist-non-react-statics';
function proxyHOC(WrappedComponent) {
  class HOCComponent extends Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  hoistNonReactStatic(HOCComponent,WrappedComponent);
  return HOCComponent;
}
```

### 告诫—传递refs

使用高阶组件后，获取到的`ref`实际上是最外层的容器组件，而非原组件，但是很多情况下我们需要用到原组件的`ref`。

高阶组件并不能像透传`props`那样将`refs`透传，我们可以用一个回调函数来完成`ref`的传递：
```js
function hoc(WrappedComponent) {
  return class extends Component {
    getWrappedRef = () => this.wrappedRef;
    render() {
      return <WrappedComponent ref={ref => { this.wrappedRef = ref }} {...this.props} />;
    }
  }
}
@hoc
class Input extends Component {
  render() { return <input></input> }
}
class App extends Component {
  render() {
    return (
      <Input ref={ref => { this.inpitRef = ref.getWrappedRef() }} ></Input>
    );
  }
}
```
`React 16.3`版本提供了一个`forwardRef API`来帮助我们进行`refs`传递，这样我们在高阶组件上获取的`ref`就是原组件的`ref`了，而不需要再手动传递，如果你的`React`版本大于`16.3`，可以使用下面的方式:

```js
function hoc(WrappedComponent) {
  class HOC extends Component {
    render() {
      const { forwardedRef, ...props } = this.props;
      return <WrappedComponent ref={forwardedRef} {...props} />;
    }
  }
  return React.forwardRef((props, ref) => {
    return <HOC forwardedRef={ref} {...props} />;
  });
}
```

### 告诫—不要在render方法内创建高阶组件

`React` `Diff`算法的原则是：

- 使用组件标识确定是卸载还是更新组件
- 如果组件的和前一次渲染时标识是相同的，递归更新子组件
- 如果标识不同卸载组件重新挂载新组件

每次调用高阶组件生成的都是是一个全新的组件，组件的唯一标识响应的也会改变，如果在`render`方法调用了高阶组件，这会导致组件每次都会被卸载后重新挂载。

### 约定-不要改变原始组件

官方文档对高阶组件的说明：

> 高阶组件就是一个没有副作用的纯函数。

我们再来看看纯函数的定义：

> 如果函数的调用参数相同，则永远返回相同的结果。它不依赖于程序执行期间函数外部任何状态或数据的变化，必须只依赖于其输入参数。
> 该函数不会产生任何可观察的副作用，例如网络请求，输入和输出设备或数据突变。

如果我们在高阶组件对原组件进行了修改，例如下面的代码：

```js
InputComponent.prototype.componentWillReceiveProps = function(nextProps) { ... }
```

这样就破坏了我们对高阶组件的约定，同时也改变了使用高阶组件的初衷：我们使用高阶组件是为了`增强`而非`改变`原组件。

### 约定-透传不相关的props

使用高阶组件，我们可以代理所有的`props`，但往往特定的`HOC`只会用到其中的一个或几个`props`。我们需要把其他不相关的`props`透传给原组件，如下面的代码：

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

我们只使用`visible`属性来控制组件的显示可隐藏，把其他`props`透传下去。

### 约定-displayName

在使用`React Developer Tools`进行调试时，如果我们使用了`HOC`，调试界面可能变得非常难以阅读，如下面的代码：

```js
@visible
class Show extends Component {
  render() {
    return <h1>我是一个标签</h1>
  }
}
@visible
class Title extends Component {
  render() {
    return <h1>我是一个标题</h1>
  }
}
```

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a94c5d5a8dc~tplv-t2oaga2asx-image.image)

为了方便调试，我们可以手动为`HOC`指定一个`displayName`，官方推荐使用`HOCName(WrappedComponentName)`：

```js
static displayName = `Visible(${WrappedComponent.displayName})`
```

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a94cdafad9e~tplv-t2oaga2asx-image.image)

这个约定帮助确保高阶组件最大程度的灵活性和可重用性。



## 使用HOC的动机


回顾下上文提到的 `Mixin` 带来的风险：

- `Mixin` 可能会相互依赖，相互耦合，不利于代码维护
- 不同的` Mixin `中的方法可能会相互冲突
- `Mixin`非常多时，组件是可以感知到的，甚至还要为其做相关处理，这样会给代码造成滚雪球式的复杂性

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a94cd939f75~tplv-t2oaga2asx-image.image)

而`HOC`的出现可以解决这些问题：

- 高阶组件就是一个没有副作用的纯函数，各个高阶组件不会互相依赖耦合
- 高阶组件也有可能造成冲突，但我们可以在遵守约定的情况下避免这些行为
- 高阶组件并不关心数据使用的方式和原因，而被包裹的组件也不关心数据来自何处。高阶组件的增加不会为原组件增加负担

## HOC的缺陷

- `HOC`需要在原组件上进行包裹或者嵌套，如果大量使用`HOC`，将会产生非常多的嵌套，这让调试变得非常困难。
- `HOC`可以劫持`props`，在不遵守约定的情况下也可能造成冲突。



## Hooks

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a94d2268081~tplv-t2oaga2asx-image.image)

`Hooks`是`React v16.7.0-alpha`中加入的新特性。它可以让你在`class`以外使用`state`和其他`React`特性。

使用`Hooks`，你可以在将含有`state`的逻辑从组件中抽象出来，这将可以让这些逻辑容易被测试。同时，`Hooks`可以帮助你在不重写组件结构的情况下复用这些逻辑。所以，它也可以作为一种实现`状态逻辑复用`的方案。

阅读下面的章节[使用Hook的动机](#使用Hook的动机)你可以发现，它可以同时解决`Mixin`和`HOC`带来的问题。

## 官方提供的Hooks

### State Hook


我们要使用`class`组件实现一个`计数器`功能，我们可能会这样写：

```js
export default class Count extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 }
  }
  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => { this.setState({ count: this.state.count + 1 }) }}>
          Click me
        </button>
      </div>
    )
  }
}
```

通过`useState`，我们使用函数式组件也能实现这样的功能：

```js
export default function HookTest() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => { setCount(count + 1); setNumber(number + 1); }}>
        Click me
        </button>
    </div>
  );
}
```

`useState`是一个钩子，他可以为函数式组件增加一些状态，并且提供改变这些状态的函数，同时它接收一个参数，这个参数作为状态的默认值。


### Effect Hook


> Effect Hook 可以让你在函数组件中执行一些具有 side effect（副作用）的操作


**参数**

`useEffect`方法接收传入两个参数：
- 1.回调函数：在第组件一次`render`和之后的每次`update`后运行，`React`保证在`DOM`已经更新完成之后才会运行回调。
- 2.状态依赖(数组)：当配置了状态依赖项后，只有检测到配置的状态变化时，才会调用回调函数。

```js
  useEffect(() => {
    // 只要组件render后就会执行
  });
  useEffect(() => {
    // 只有count改变时才会执行
  },[count]);
```

**回调返回值**

`useEffect`的第一个参数可以返回一个函数，当页面渲染了下一次更新的结果后，执行下一次`useEffect`之前，会调用这个函数。这个函数常常用来对上一次调用`useEffect`进行清理。

```js
export default function HookTest() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('执行...', count);
    return () => {
      console.log('清理...', count);
    }
  }, [count]);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => { setCount(count + 1); setNumber(number + 1); }}>
        Click me
        </button>
    </div>
  );
}
```
执行上面的代码，并点击几次按钮，会得到下面的结果：

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/10/16a04a94e8279309~tplv-t2oaga2asx-image.image)

注意，如果加上浏览器渲染的情况，结果应该是这样的：

```js
 页面渲染...1
 执行... 1
 页面渲染...2
 清理... 1
 执行... 2
 页面渲染...3
 清理... 2
 执行... 3
 页面渲染...4
 清理... 3
 执行... 4
```

那么为什么在浏览器渲染完后，再执行清理的方法还能找到上次的`state`呢？原因很简单，我们在`useEffect`中返回的是一个函数，这形成了一个闭包，这能保证我们上一次执行函数存储的变量不被销毁和污染。

你可以尝试下面的代码可能更好理解

```js
    var flag = 1;
    var clean;
    function effect(flag) {
      return function () {
        console.log(flag);
      }
    }
    clean = effect(flag);
    flag = 2;
    clean();
    clean = effect(flag);
    flag = 3;
    clean();
    clean = effect(flag);

    // 执行结果

    effect... 1
    clean... 1
    effect... 2
    clean... 2
    effect... 3
```

**模拟componentDidMount**

`componentDidMount`等价于`useEffect`的回调仅在页面初始化完成后执行一次，当`useEffect`的第二个参数传入一个空数组时可以实现这个效果。

```js
function useDidMount(callback) {
  useEffect(callback, []);
}
```

> 官方不推荐上面这种写法，因为这有可能导致一些错误。

**模拟componentWillUnmount**

```js
function useUnMount(callback) {
  useEffect(() => callback, []);
}
```

> 不像 componentDidMount 或者 componentDidUpdate，useEffect 中使用的 effect 并不会阻滞浏览器渲染页面。这让你的 app 看起来更加流畅。


### ref Hook

使用`useRef Hook`，你可以轻松的获取到`dom`的`ref`。

```js
export default function Input() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    inputEl.current.focus();
  };
  return (
    <div>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </div>
  );
}
```

注意`useRef()`并不仅仅可以用来当作获取`ref`使用，使用`useRef`产生的`ref`的`current`属性是可变的，这意味着你可以用它来保存一个任意值。

**模拟componentDidUpdate**

`componentDidUpdate`就相当于除去第一次调用的`useEffect`，我们可以借助`useRef`生成一个标识，来记录是否为第一次执行：

```js
function useDidUpdate(callback, prop) {
  const init = useRef(true);
  useEffect(() => {
    if (init.current) {
      init.current = false;
    } else {
      return callback();
    }
  }, prop);
}

```

## 使用Hook的注意事项

### 使用范围

- 只能在`React`函数式组件或自定义`Hook`中使用`Hook`。

`Hook`的提出主要就是为了解决`class`组件的一系列问题，所以我们能在`class`组件中使用它。 

### 声明约束

- 不要在循环，条件或嵌套函数中调用Hook。

`Hook`通过数组实现的，每次` useState` 都会改变下标，`React`需要利用调用顺序来正确更新相应的状态，如果` useState` 被包裹循环或条件语句中，那每就可能会引起调用顺序的错乱，从而造成意想不到的错误。

我们可以安装一个`eslint`插件来帮助我们避免这些问题。
```js
// 安装
npm install eslint-plugin-react-hooks --save-dev
// 配置
{
  "plugins": [
    // ...
    "react-hooks"
  ],
  "rules": {
    // ...
    "react-hooks/rules-of-hooks": "error"
  }
}
```


## 自定义Hook

像上面介绍的`HOC`和`mixin`一样，我们同样可以通过自定义的`Hook`将组件中类似的状态逻辑抽取出来。

自定义`Hook`非常简单，我们只需要定义一个函数，并且把相应需要的状态和`effect`封装进去，同时，`Hook`之间也是可以相互引用的。使用`use`开头命名自定义`Hook`，这样可以方便`eslint`进行检查。

下面我们看几个具体的`Hook`封装：
 

### 日志打点

我们可以使用上面封装的生命周期`Hook`。

```js
const useLogger = (componentName, ...params) => {
  useDidMount(() => {
    console.log(`${componentName}初始化`, ...params);
  });
  useUnMount(() => {
    console.log(`${componentName}卸载`, ...params);
  })
  useDidUpdate(() => {
    console.log(`${componentName}更新`, ...params);
  });
};

function Page1(props){
  useLogger('Page1',props);
  return (<div>...</div>)
}
```

### 修改title

根据不同的页面名称修改页面`title`:

```js
function useTitle(title) {
  useEffect(
    () => {
      document.title = title;
      return () => (document.title = "主页");
    },
    [title]
  );
}
function Page1(props){
  useTitle('Page1');
  return (<div>...</div>)
}
```

### 双向绑定

我们将表单`onChange`的逻辑抽取出来封装成一个`Hook`，这样所有需要进行双向绑定的表单组件都可以进行复用：
```js
function useBind(init) {
  let [value, setValue] = useState(init);
  let onChange = useCallback(function(event) {
    setValue(event.currentTarget.value);
  }, []);
  return {
    value,
    onChange
  };
}
function Page1(props){
  let value = useBind('');
  return <input {...value} />;
}
```

当然，你可以向上面的`HOC`那样，结合`context`和`form`来封装一个更通用的双向绑定，有兴趣可以手动实现一下。

## 使用Hook的动机

### 减少状态逻辑复用的风险

`Hook`和`Mixin`在用法上有一定的相似之处，但是`Mixin`引入的逻辑和状态是可以相互覆盖的，而多个`Hook`之间互不影响，这让我们不需要在把一部分精力放在防止避免逻辑复用的冲突上。

在不遵守约定的情况下使用`HOC`也有可能带来一定冲突，比如`props`覆盖等等，使用`Hook`则可以避免这些问题。

### 避免地狱式嵌套

大量使用`HOC`的情况下让我们的代码变得嵌套层级非常深，使用`Hook`，我们可以实现扁平式的状态逻辑复用，而避免了大量的组件嵌套。

### 让组件更容易理解

在使用`class`组件构建我们的程序时，他们各自拥有自己的状态，业务逻辑的复杂使这些组件变得越来越庞大，各个生命周期中会调用越来越多的逻辑，越来越难以维护。使用`Hook`，可以让你更大限度的将公用逻辑抽离，将一个组件分割成更小的函数，而不是强制基于生命周期方法进行分割。

### 使用函数代替class

相比函数，编写一个`class`可能需要掌握更多的知识，需要注意的点也越多，比如`this`指向、绑定事件等等。另外，计算机理解一个函数比理解一个`class`更快。`Hooks`让你可以在`classes`之外使用更多`React`的新特性。

## 理性的选择

实际上，`Hook`在`react 16.8.0`才正式发布`Hook`稳定版本，笔者也还未在生产环境下使用，目前笔者在生产环境下使用的最多的是`HOC
`。

`React`官方完全没有把`classes`从`React`中移除的打算，`class`组件和`Hook`完全可以同时存在，官方也建议避免任何“大范围重构”，毕竟这是一个非常新的版本，如果你喜欢它，可以在新的非关键性的代码中使用`Hook`。

## 小结

`mixin`已被抛弃，`HOC`正当壮年，`Hook`初露锋芒，前端圈就是这样，技术迭代速度非常之快，但我们在学习这些知识之时一定要明白为什么要学，学了有没有用，要不要用。不忘初心，方得始终。

文中如有错误，欢迎在评论区指正，谢谢阅读。

## 推荐阅读
- [【React深入】setState的执行机制](https://juejin.im/post/6844903781813993486)
- [【React深入】React事件机制](https://juejin.im/post/6844903790198571021)



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
