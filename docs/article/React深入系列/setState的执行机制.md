---
title: setState的执行机制
date: 2019-03-06 16:12:35
tags:
     - React
---


![image](/img/setstate.jpg)

## 一.几个开发中经常会遇到的问题

以下几个问题是我们在实际开发中经常会遇到的场景，下面用几个简单的示例代码来还原一下。

#### 1.setState是同步还是异步的，为什么有的时候不能立即拿到更新结果而有的时候可以?

1.1 钩子函数和React合成事件中的`setState`

现在有两个组件

```javascript
  componentDidMount() {
    console.log('parent componentDidMount');
  }

  render() {
    return (
      <div>
        <SetState2></SetState2>
        <SetState></SetState>
      </div>
    );
  }
```

组件内部放入同样的代码，并在`Setstate1`中的`componentDidMount`中放入一段同步延时代码，打印延时时间：

```javascript
  componentWillUpdate() {
    console.log('componentWillUpdate');
  }

  componentDidUpdate() {
    console.log('componentDidUpdate');
  }

  componentDidMount() {
    console.log('SetState调用setState');
    this.setState({
      index: this.state.index + 1
    })
    console.log('state', this.state.index);
    
    console.log('SetState调用setState');
    this.setState({
      index: this.state.index + 1
    })
    console.log('state', this.state.index);
  }
```

下面是执行结果：

![image](https://user-gold-cdn.xitu.io/2019/2/23/169197bbda942d55?w=332&h=337&f=png&s=37749)

说明：

- 1.调用`setState`不会立即更新
- 2.所有组件使用的是同一套更新机制，当所有组件`didmount`后，父组件`didmount`，然后执行更新
- 3.更新时会把每个组件的更新合并，每个组件只会触发一次更新的生命周期。

1.2 异步函数和原生事件中的`setstate`？

在`setTimeout`中调用`setState`（例子和在浏览器原生事件以及接口回调中执行效果相同）
```
  componentDidMount() {
    setTimeout(() => {
      console.log('调用setState');
      this.setState({
        index: this.state.index + 1
      })
      console.log('state', this.state.index);
      console.log('调用setState');
      this.setState({
        index: this.state.index + 1
      })
      console.log('state', this.state.index);
    }, 0);
  }
```

执行结果：

![image](https://user-gold-cdn.xitu.io/2019/2/23/169197bbda86af04?w=244&h=219&f=png&s=20237)

说明：

- 1.在父组件`didmount`后执行
- 2.调用`setState`同步更新


#### 2.为什么有时连续两次`setState`只有一次生效？

分别执行以下代码：

```javascript
  componentDidMount() {
    this.setState({ index: this.state.index + 1 }, () => {
      console.log(this.state.index);
    })
    this.setState({ index: this.state.index + 1 }, () => {
      console.log(this.state.index);
    })
  }
```

```javascript
  componentDidMount() {
    this.setState((preState) => ({ index: preState.index + 1 }), () => {
      console.log(this.state.index);
    })
    this.setState(preState => ({ index: preState.index + 1 }), () => {
      console.log(this.state.index);
    })
  }
```

执行结果：

```
1
1
```
```
2
2
```

说明：

- 1.直接传递对象的`setstate`会被合并成一次
- 2.使用函数传递`state`不会被合并

## 二.setState执行过程

由于源码比较复杂，就不贴在这里了，有兴趣的可以去`github`上`clone`一份然后按照下面的流程图去走一遍。

### 1.流程图

![setState](https://user-gold-cdn.xitu.io/2019/2/23/169197bbdc7ae14e?w=982&h=2387&f=png&s=147606)

- `partialState`：`setState`传入的第一个参数，对象或函数
- `_pendingStateQueue`：当前组件等待执行更新的`state`队列
- `isBatchingUpdates`：react用于标识当前是否处于批量更新状态，所有组件公用
- `dirtyComponent`：当前所有处于待更新状态的组件队列
- `transcation`：react的事务机制，在被事务调用的方法外包装n个`waper`对象，并一次执行：`waper.init`、被调用方法、`waper.close`
- `FLUSH_BATCHED_UPDATES`：用于执行更新的`waper`，只有一个`close`方法

### 2.执行过程

对照上面流程图的文字说明，大概可分为以下几步：

- 1.将setState传入的`partialState`参数存储在当前组件实例的state暂存队列中。
- 2.判断当前React是否处于批量更新状态，如果是，将当前组件加入待更新的组件队列中。
- 3.如果未处于批量更新状态，将批量更新状态标识设置为true，用事务再次调用前一步方法，保证当前组件加入到了待更新组件队列中。
- 4.调用事务的`waper`方法，遍历待更新组件队列依次执行更新。
- 5.执行生命周期`componentWillReceiveProps`。
- 6.将组件的state暂存队列中的`state`进行合并，获得最终要更新的state对象，并将队列置为空。
- 7.执行生命周期`componentShouldUpdate`，根据返回值判断是否要继续更新。
- 8.执行生命周期`componentWillUpdate`。
- 9.执行真正的更新，`render`。
- 10.执行生命周期`componentDidUpdate`。


## 三.总结

### 1.钩子函数和合成事件中：

在`react`的生命周期和合成事件中，`react`仍然处于他的更新机制中，这时`isBranchUpdate`为true。

按照上述过程，这时无论调用多少次`setState`，都会不会执行更新，而是将要更新的`state`存入`_pendingStateQueue`，将要更新的组件存入`dirtyComponent`。

当上一次更新机制执行完毕，以生命周期为例，所有组件，即最顶层组件`didmount`后会将`isBranchUpdate`设置为false。这时将执行之前累积的`setState`。


### 2.异步函数和原生事件中

由执行机制看，`setState`本身并不是异步的，而是如果在调用`setState`时，如果`react`正处于更新过程，当前更新会被暂存，等上一次更新执行后在执行，这个过程给人一种异步的假象。

在生命周期，根据JS的异步机制，会将异步函数先暂存，等所有同步代码执行完毕后在执行，这时上一次更新过程已经执行完毕，`isBranchUpdate`被设置为false，根据上面的流程，这时再调用`setState`即可立即执行更新，拿到更新结果。


### 3.`partialState`合并机制

我们看下流程中`_processPendingState`的代码，这个函数是用来合并`state`暂存队列的，最后返回一个合并后的`state`。

```javascript

  _processPendingState: function (props, context) {
    var inst = this._instance;
    var queue = this._pendingStateQueue;
    var replace = this._pendingReplaceState;
    this._pendingReplaceState = false;
    this._pendingStateQueue = null;

    if (!queue) {
      return inst.state;
    }

    if (replace && queue.length === 1) {
      return queue[0];
    }

    var nextState = _assign({}, replace ? queue[0] : inst.state);
    for (var i = replace ? 1 : 0; i < queue.length; i++) {
      var partial = queue[i];
      _assign(nextState, typeof partial === 'function' ? partial.call(inst, nextState, props, context) : partial);
    }

    return nextState;
  },
```

我们只需要关注下面这段代码：

```javascript
 _assign(nextState, typeof partial === 'function' ? partial.call(inst, nextState, props, context) : partial);
```

如果传入的是对象，很明显会被合并成一次：

```javascript
Object.assign(
  nextState,
  {index: state.index+ 1},
  {index: state.index+ 1}
)
```

如果传入的是函数，函数的参数preState是前一次合并后的结果，所以计算结果是准确的。


### 4.componentDidMount调用setstate

>在componentDidMount()中，你 可以立即调用setState()。它将会触发一次额外的渲染，但是它将在浏览器刷新屏幕之前发生。这保证了在此情况下即使render()将会调用两次，用户也不会看到中间状态。谨慎使用这一模式，因为它常导致性能问题。在大多数情况下，你可以 在constructor()中使用赋值初始状态来代替。然而，有些情况下必须这样，比如像模态框和工具提示框。这时，你需要先测量这些DOM节点，才能渲染依赖尺寸或者位置的某些东西。

以上是官方文档的说明，不推荐直接在`componentDidMount`直接调用`setState`，由上面的分析：`componentDidMount`本身处于一次更新中，我们又调用了一次`setState`，就会在未来再进行一次`render`，造成不必要的性能浪费，大多数情况可以设置初始值来搞定。

当然在`componentDidMount`我们可以调用接口，再回调中去修改`state`，这是正确的做法。

当state初始值依赖dom属性时，在`componentDidMount`中`setState`是无法避免的。

### 5.componentWillUpdate、componentDidUpdate

这两个生命周期中不能调用`setState`。

由上面的流程图很容易发现，在它们里面调用`setState`会造成死循环，导致程序崩溃。

### 6.推荐使用方式

在调用`setState`时使用函数传递`state`值，在回调函数中获取最新更新后的`state`。