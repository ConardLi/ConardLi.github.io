---
title: 从Mixin到HOC再到Hook（四）
date: 2019-04-09 23:27:27
tags:
     - React
---


## Hooks

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc10.png)

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

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hook1.png)

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

大量使用`HOC`的情况下让我们的代码变得嵌套层级非常深，使用`HOC`，我们可以实现扁平式的状态逻辑复用，而避免了大量的组件嵌套。

### 让组件更容易理解

在使用`class`组件构建我们的程序时，他们各自拥有自己的状态，业务逻辑的复杂使这些组件变得越来越庞大，各个生命周期中会调用越来越多的逻辑，越来越难以维护。使用`Hook`，可以让你更大限度的将公用逻辑抽离，将一个组件分割成更小的函数，而不是强制基于生命周期方法进行分割。

### 使用函数代替class

相比函数，编写一个`class`可能需要掌握更多的知识，需要注意的点也越多，比如`this`指向、绑定事件等等。另外，计算机理解一个`class`比理解一个函数更快。`Hooks`让你可以在`classes`之外使用更多`React`的新特性。

## 理性的选择

实际上，`Hook`在`react 16.8.0`才正式发布`Hook`稳定版本，笔者也还未在生产环境下使用，目前笔者在生产环境下使用的最多的是`HOC
`。

`React`官方完全没有把`classes`从`React`中移除的打算，`class`组件和`Hook`完全可以同时存在，官方也建议避免任何“大范围重构”，毕竟这是一个非常新的版本，如果你喜欢它，可以在新的非关键性的代码中使用`Hook`。

## 小结

`mixin`已被抛弃，`HOC`正当壮年，`Hook`初露锋芒，前端圈就是这样，技术迭代速度非常之快，但我们在学习这些知识之时一定要明白为什么要学，学了有没有用，要不要用。不忘初心，方得始终。

文中如有错误，欢迎在评论区指正，谢谢阅读。

