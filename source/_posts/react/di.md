---
title: 如何在 React 中实现更高级的依赖注入
category: React
tag: 
- React
- 最佳实践
- 设计模式
- 前端架构
date: 2021-07-12	
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



控制反转（`Inversion of Control`，缩写为IoC），是面向对象编程中的一种设计原则，可以用来减低计算机代码之间的耦合度，其中最常见的方式就是依赖注入（`Dependency Injection`，简称DI）。

通过控制反转，对象在被创建的时候，由一个调控系统内所有对象的外界实体将其所依赖的对象的引用传递给它。也可以说，依赖被注入到对象中。

一般这个概念在 Java 中提的比较多，但是在前端领域，似乎很少会提到这个概念，其实用好这个思想无论在前后端一样可以帮助我们的组件解耦，本文将介绍一下依赖注入在 React 中的应用。

## 为啥需要依赖注入？

依赖注入（更广泛地说就是控制反转）主要用来解决下面几个问题：

- 模块解耦 - 在代码设计中应用，强制保持代码模块分离。
- 更好的可复用性 - 让模块复用更加容易。
- 更好的可测试性 - 通过注入模拟依赖可以更方便测试。

其实， React 本身也内置了对依赖注入的支持。

## React 中的依赖注入

下面几个常见的代码，其实都应用了依赖注入的思想，我们来看几个例子：

1. 使用 props 允许依赖注入

```js
function welcome(props) {
  return <h1> Hello, {props.name}</h1>;
}
```

 `welcome` 组件通过接收 `props` 然后生成 `html`，别惊讶，我们最常用的 `props` 其实就是应用了依赖注入的思想。
 
 2. 使用 context 是实现依赖注入的另一种方法
 
 
```js
function counter() {
  const { message } = useContext(MessageContext);
  return <p>{ message }</p>;
}
```
 
 由于 `context` 是沿着组件树向下传递的，我们可以使用组件内部的 `hooks` 来提取到它。

3. 只使用 jsx 也能实现依赖注入

```js
const ReviewList = props => ( 
  <List resource="/reviews" perPage={50} {...props}> 
    <Da​​tagrid rowClick="edit"> 
      <Da​​teField source="date" /> 
      <CustomerField source="customer_id " /> 
      <ProductField source="product_id" /> 
      <StatusField source="status" /> 
    </Datagrid> 
  </List> 
);
```
 
 
`perPage` 参数被传递给 `<List>`组件，然后组件通过 `REST API` 获取远程数据。

 但是，`<List>` 组件并不会直接渲染数据，相反，它把渲染数据的重任交给了子组件 `<Datagrid>`。`<Datagrid>` 组件的渲染依赖于 `<List>`，`<List>` 是设置这种依赖关系的调用者。
 
 
> 但是，这些策略可能对小型项目有所帮助。在一些大型项目中往往我们需要更灵活的扩展，除了这些基础的应用之外，我们还需要更好地支持依赖注入。
 
我们来看几个扩展 React 依赖注入支持的库。

## InversifyJS

InversifyJS 是一个强大、轻量的依赖注入库，并且使用非常简单，但是把它和 React 组件结合使用还是有些问题。

因为 `InversifyJS` 默认使用构造函数注入，但是 React 不允许开发者扩展组件的构造函数。我们通过一个例子来看看如何解决这个问题：

 
```js
import "reflect-metadata";
import * as React from "react";
import { render } from "react-dom";
import { Hello } from "./Hello";

const App = () => (
  <div>
    <Hello />
  </div>
);

render(<App />, document.getElementById("root"));
```

通过 `InversifyJS` 提供的 `injectable decorator` 可以标记这个 `class` 是可被注入的。
 
```js
import { injectable } from "inversify";

export interface IProvider<T> {
  provide(): T;
}

@injectable()
export class NameProvider implements IProvider<string> {
  provide() {
    return "World";
  }
}
```

在组件中，我们可以直接调用注入的 `provide` 方法，而组件内部不用关心它的实现。

```js
import * as React from "react";
import { IProvider } from "./providers";

export class Hello extends React.Component {
  private readonly nameProvider: IProvider<string>;

  render() {
    return <h1>Hello {this.nameProvider.provide()}!</h1>;
  }
}
```

这就是一个最简单的依赖注入，下面我们再来看看几个 InversifyJS 的扩展库。
 
 
 ## inversify-inject-decorators
 
该工具库主要提供了 `lazyInject` 之类的方法，它可以给出了一个惰性的注入，意思是在对象初始化时不需要提供依赖，当我们没办法改构造函数时，这个库就派上用场啦。

另外，除了字面上所说的惰性，另外一个非常重要的功能就是允许你将 `inversifyJs` 集成到任何自己控制类实例创建的库或者框架，比如 `React` 。
 
下面是一个 `@lazyInject` 的使用示例：

```js
import getDecorators from "inversify-inject-decorators";
import { Container, injectable, tagged, named } from "inversify";
 
let container = new Container();
let { lazyInject } = getDecorators(container);
let TYPES = { Weapon: "Weapon" };
 
interface Weapon {
    name: string;
    durability: number;
    use(): void;
}
 
@injectable()
class Sword implements Weapon {
    public name: string;
    public durability: number;
    public constructor() {
        this.durability = 100;
        this.name = "Sword";
    }
    public use() {
        this.durability = this.durability - 10;
    }
}
 
class Warrior {
    @lazyInject(TYPES.Weapon)
    public weapon: Weapon;
}
 
container.bind<Weapon>(TYPES.Weapon).to(Sword);
 
let warrior = new Warrior();
console.log(warrior.weapon instanceof Sword); // true
```

## inversify-react

`inversify-react` 是一个唯一执行依赖注入的库。就像使用 `React Context.Provider` 一样，我们从这个库也能拿到一个 `Provider`：


 
```js
import { Provider } from 'inversify-react';
...

<Provider container={myContainer}>
    ...
</Provider>
```

然后我们就能在子组件中使用依赖了：
 
```js
import { resolve, useInjection } from 'inversify-react';
...

// In functional component – via hooks
const ChildComponent: React.FC = () => {
    const foo = useInjection(Foo);
    ...
};

// or in class component – via decorated fields
class ChildComponent extends React.Component {
    @resolve
    private readonly foo: Foo;
    ...
}
```

## react-inversify


虽然和上一个库名字很像，但是两个库的做法是不一样的，这种方法更接近于 React 的思想，因为对象是作为属性传递的，而不是在组件内部实例化。

```js
import * as React from 'react';
import * as inversify from 'inversify';
import { Todos } from "./model";
import { connect } from 'react-inversify';
 
class Dependencies {
    constructor(todos) {
        this.todos = todos;
    }
}
 
inversify.decorate(inversify.injectable(), Dependencies);
inversify.decorate(inversify.inject(Todos.TypeTag), Dependencies, 0);
 
class TodoItemView extends React.Component {
    // ... use this.props.checked,  this.props.text, etc. All these calculated by code below.
}
 ssed as React properties.
// Mapping function returns final TodoItemView's properties.
export default connect(Dependencies, (deps, ownProps) => ({
    checked: ownProps.item.isChecked(),
    text: ownProps.item.getText(),
    todos: deps.todos,
    item: ownProps.item
}))(TodoItemView);
```

```js
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as inversify from 'inversify';
import { Provider, ChangeNotification } from 'react-inversify';
 
var container = new inversify.Container(); // your DI container
var changeNotification = new ChangeNotification(); // handles changes in model objects

ReactDOM.render(
    <Provider container={container} changeNotification={changeNotification}>
        <TodoListView />
    </Provider>,
    document.getElementById('app')
);
```


## 参考：

- https://www.npmjs.com/package/inversify-inject-decorators
- https://www.npmjs.com/package/inversify-react
- https://www.npmjs.com/package/react-inversify
- https://blog.bitsrc.io/advanced-dependency-injection-in-react-af962bb94d35
 


## 最后

`React` 生态系统中的许多流行库都在使用依赖注入，例如 `React Router` 和 `Redux`。此外，`React` 还直接支持依赖注入。

但是，对于一些高级的用法，我们需要类似 `InversifyJS` 之类的库，选择一个适合你的库吧！希望本文能帮到你。


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。