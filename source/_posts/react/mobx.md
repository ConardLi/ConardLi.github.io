---
title: 使用 React Mobx 的几个最佳实践
category: React
tag:
- React
- 最佳实践
- Mobx
- 状态管理
date: 2020-11-19
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



Mobx 是我非常喜欢的 React 状态管理库，它非常灵活，同时它的灵活也会给开发带来非常多的问题，因此我们在开发的时候也要遵循一些写法上的最佳实践，使我们的程序达到最好的效果。

## 在 store 中维护业务逻辑

尽量不要把业务逻辑写在 `React Component` 里面。当你把业务逻辑写在组件里面的时候，很难及时定位错误的，因为业务逻辑分散在各种不同的组件里面，让你很难来通过行为来定义到底是哪些代码涉及的这个错误，不同组件复用这些逻辑也很困难。

最好在 `stores` 中把业务逻辑编写成方法，并在你的 `Component` 中调用这些方法。

## 只允许在 store 中修改属性

尽量不要在一个 `Component` 里直接修改一个 `store` 的属性。只有 `store` 本身可以修改他自己的属性。

当你要改变属性的时候，请调用相应的 `store` 方法。不然的话你的属性修改会散落在各处不受控制，这是很难调试的。

```js
class Store {
  @observable text;
  
  @action.bound
  handleSearch = value => {
    this.text = value
  }
}

const store = new Store();

@observer
class Home extends Component {
  
  handleChanged = (event) => {
    store.handleSearch(event.target.value);
  }
  
  render() {
    return (
      <input
        value={store.searchText}
        onChange={this.handleChanged}
      />
    );
  }
}
```

## 所有属性更改都用 action

使用 `action` 后，可以清楚的看出哪些代码可以更改可观察的变量，并且方便调试工具给出更多的信息

使用 `transaction` 可以将多个应用状态(`Observable`)的更新视为一次操作，并只触发一次监听者(`Reactions`)的动作(UI更新、网络请求等)，避免多次重复渲染。`action`中封装了`transaction`，多次改变`@observable`变量时，只会重新渲染一次，提高了性能。

```js
class Store {
  @observable name;
  @observable age;

  @action
  change(name,age){
    this.name = name;
    this.age = age;
  }
}
```

## 从 store 中分离出 API 请求

不要在你的 `store` 里调用 `API` 接口，这会让它们很难测试，也让代码变的更复杂和耦合。额外建一个类，把 `API` 接口调用放进去，并在 `store` 的构造函数里实例化他们来使用。当你编写测试代码时，你可以很容易地模拟这些 `api` 并把你的模拟 `api` 实例传给每一个 `store`。

```js
class UserService {

  fetchUser = () => axios.get('/api/user')
}

class Store {

  @observable todos = [];

  constructor(userService) {
    this.userService = userService;
  }

  fetchUser = async () => {
    const todos = await this.userService.fetchUser();

    runInAction(() => {
      this.todos = todos;
    });
  }
}

const userService = new UserService();
const store = new Store(userService);
```

## 对每一个 component 都声明 @observer

`@observer` 可以用来将 `React` 组件转变成响应式组件。它用 `mobx.autorun` 包装了组件的 `render` 函数以确保任何组件渲染中使用的数据变化时都可以强制刷新组件。

给每一个 `component` 都标注 `@observer` ，这可以使得他们可以随着 `store prop` 的改变而更新。如果子组件没有标注 `@observer` 的话，就会导致其父 `component` （有 `@observer` ）刷新。因此我们要尽可能的让每个子 `component` 都标注 `@observer` ，这可以减少不必要的重新渲染。

## 不要缓存 observables 属性

`Observer` 组件只会追踪在 `render` 方法中存取的数据。如果你从 `observable` 属性中提取数据并将其缓存在组件里，这样的数据是不会被追踪的:

```js
class Store {
  @observable name;
  @observable age;
}

class Home extends React.Component {

  componentWillMount() {
    // 错误的，info 的更新不会被追踪
    this.info = store.name + store.age
  }

  render() {
    return <div>{this.info}</div>
  }
}
```

## 使用 @computed

比如刚刚的例子，使用 `@computed` 属性来处理一些涉及多个属性的逻辑。使用 `@computed` 可以减少这样的判断类业务逻辑在组件里面出现的频率。

```js
class Store {
  @observable name;
  @observable age;

  @computed info = () => {
    return this.name + this.age;
  }
}

class Home extends React.Component {

  render() {
    return <div>{store.info}</div>
  }
}
```

## 多编写受控组件

多编写可控组件，这样会大大降低你的测试复杂度，也让你的组件易于管理。

## 当需要追踪对象属性时、使用 map

`MobX` 可以做许多事，但是它无法将原始类型值转变成 `observable` (尽管可以用对象来包装它们)。所以说值不是 `observable`，而对象的属性才是。这意味着 `@observer` 实际上是对间接引用值作出反应。所以如果像下面这样初始化的话，`Timer` 组件是不会作出任何反应的:

```js
ReactDom.render(<Timer timerData={timerData.secondsPassed} />, document.body)
```

在这行代码中，只是 `secondsPassed` 的当前值传递给了 `Timer`，这个值是不可变值 (JS中的所有原始类型值都是不可变的)。这个值永远都不会改变，所以 `Timer` 也永远不会更新。 `secondsPassed` 属性将来会改变，所以我们需要在组件内访问它。或者换句话说: 永远只传递拥有 `observable` 属性的对象。

如果你想追踪对象中每个属性的变更，可以使用 `map`：

`observable.map(values?)` 创建一个动态键的 `observable` 映射。如果你不但想对一个特定项的更改做出反应，而且对添加或删除该项也做出反应的话，那么 `observable` 映射会非常有用。

```js
class Store {
  timerData = @observable.map({secondsPassed:0});

  @action.bound
  change(value){
    this.timerData.set('secondsPassed',value);
  }
}

class Home extends React.Component {

  render() {
    return <div>{store.timerData.get('secondsPassed')}</div>
  }
}
```



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
