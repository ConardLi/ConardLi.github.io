---
title: 从Mixin到HOC再到Hook（三）
date: 2019-04-09 23:27:27
tags:
     - React
---


## HOC的实际应用

下面是一些我在公司项目中实际对`HOC`的实际应用场景，由于文章篇幅原因，代码经过很多简化，如有问题欢迎在评论区指出：

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

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc4.png)

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


![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc11.png)


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

### 告诫—不要在render方法内使用高阶组件

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

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc5.png)

为了方便调试，我们可以手动为`HOC`指定一个`displayName`，官方推荐使用`HOCName(WrappedComponentName)`：

```js
static displayName = `Visible(${WrappedComponent.displayName})`
```

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc6.png)

这个约定帮助确保高阶组件最大程度的灵活性和可重用性。



## 使用HOC的动机


回顾下上文提到的 `Mixin` 带来的风险：

- `Mixin` 可能会相互依赖，相互耦合，不利于代码维护
- 不同的` Mixin `中的方法可能会相互冲突
- `Mixin`非常多时，组件是可以感知到的，甚至还要为其做相关处理，这样会给代码造成滚雪球式的复杂性

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc7.png)

而`HOC`的出现可以解决这些问题：

- 高阶组件就是一个没有副作用的纯函数，各个高阶组件不会互相依赖耦合
- 高阶组件也有可能造成冲突，但我们可以在遵守约定的情况下避免这些行为
- 高阶组件并不关心数据使用的方式和原因，而被包裹的组件也不关心数据来自何处。高阶组件的增加不会为原组件增加负担

## HOC的缺陷

- `HOC`需要在原组件上进行包裹或者嵌套，如果大量使用`HOC`，将会产生非常多的嵌套，这让调试变得非常困难。
- `HOC`可以劫持`props`，在不遵守约定的情况下也可能造成冲突。


文中如有错误，欢迎在评论区指正，谢谢阅读。

