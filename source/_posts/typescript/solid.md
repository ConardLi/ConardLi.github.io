---
title: 基于 TypeScript 理解程序设计的 SOLID 原则
category: TypeScript
tag: 
- TypeScript
date: 2022-03-24	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


今天我们来基于 `TypeScript` 回顾学习下程序设计中的 `SOLID` 原则。


说到 `SOLID` 原则，可能写过代码的同学们应该都听过吧，这是程序设计领域最常用到的设计原则。`SOLID` 由 `罗伯特·C·马丁` 在 21 世纪早期引入，指代了面向对象编程和面向对象设计的五个基本原则， `SOLID` 其实是以下五个单词的缩写：

- `Single Responsibility Principle`（单一职责原则）
- `Open Closed Principle`（开闭原则）
- `Liskov Substitution Principle`（里氏替换原则）
- `Interface Segregation Principle`（接口隔离原则）
- `Dependency Inversion Principle`（依赖倒置原则）


`TypeScript` 的出现让我们可以用面向对象的思想编写出更简洁的 `JavaScript` 代码，在下面的文章中，我们将用 `TypeScript` 编写一些示例来分别解释下这些原则。

## 单一职责原则（SRP）

> 核心思想：类的职责应该单一，不要承担过多的职责。 

我们先看看下面这段代码，我们为 `Book` 创建了一个类，但是类中却承担了多个职责，比如把书保存为一个文件：

```ts
class Book {
  public title: string;
  public author: string;
  public description: string;
  public pages: number;

  // constructor and other methods

  public saveToFile(): void {
    // some fs.write method to save book to file
  }
}
```

遵循单一职责原则，我们应该创建两个类，分别负责不同的事情：

```ts
class Book {
  public title: string;
  public author: string;
  public description: string;
  public pages: number;

  // constructor and other methods
}

class Persistence {
  public saveToFile(book: Book): void {
    // some fs.write method to save book to file
  }
}
```


> 好处：降低类的复杂度、提高可读性、可维护性、扩展性、最大限度的减少潜在的副作用。


## 开闭原则（OCP）

> 核心思想：类应该对扩展开放，但对修改关闭。简单理解就是当别人要修改软件功能的时候，不能让他修改我们原有代码，尽量让他在原有的基础上做扩展。


先看看下面这段写的不太好的代码，我们单独封装了一个 `AreaCalculator` 类来负责计算 `Rectangle` 和 `Circle` 类的面积。想象一下，如果我们后续要再添加一个形状，我们要创建一个新的类，同时我们也要去修改 `AreaCalculator` 来计算新类的面积，这违反了开闭原则。
 
```ts
class Rectangle {
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

class Circle {
  public radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }
}

class AreaCalculator {
  public calculateRectangleArea(rectangle: Rectangle): number {
    return rectangle.width * rectangle.height;
  }

  public calculateCircleArea(circle: Circle): number {
    return Math.PI * (circle.radius * circle.radius);
  }
}
```

为了遵循开闭原则，我们只需要添加一个名为 `Shape` 的接口，每个形状类（矩形、圆形等）都可以通过实现它来依赖该接口。通过这种方式，我们可以将 `AreaCalculator` 类简化为一个带有参数的函数，每当我们创建一个新的形状类，都必须实现这个函数，这样就不需要修改原有的类了：

```ts
interface Shape {
  calculateArea(): number;
}

class Rectangle implements Shape {
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public calculateArea(): number {
    return this.width * this.height;
  }
}

class Circle implements Shape {
  public radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  public calculateArea(): number {
    return Math.PI * (this.radius * this.radius);
  }
}

class AreaCalculator {
  public calculateArea(shape: Shape): number {
    return shape.calculateArea();
  }
}
```


## 里氏替换原则（LSP）

> 核心思想：在使用基类的的地方可以任意使用其子类，能保证子类完美替换基类。简单理解就是所有父类能出现的地方，子类就可以出现，并且替换了也不会出现任何错误。

我们必须要求子类的所有相同方法，都必须遵循父类的约定，否则当父类替换为子类时就会出错。

先来看看下面这段代码，`Square` 类扩展了 `Rectangle` 类。但是这个扩展没有任何意义，因为我们通过覆盖宽度和高度属性来改变了原有的逻辑。

```ts
class Rectangle {
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public calculateArea(): number {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  public _width: number;
  public _height: number;

  constructor(width: number, height: number) {
    super(width, height);

    this._width = width;
    this._height = height;
  }
}
```

遵循里氏替换原则，我们不需要覆盖基类的属性，而是直接删除掉 `Square` 类并，将它的逻辑带到 `Rectangle` 类，而且也不改变其用途。

```ts
class Rectangle {
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public calculateArea(): number {
    return this.width * this.height;
  }

  public isSquare(): boolean {
    return this.width === this.height;
  }
}
```


> 好处：增强程序的健壮性，即使增加了子类，原有的子类还可以继续运行。



## 接口隔离原则（ISP）


> 核心思想：类间的依赖关系应该建立在最小的接口上。简单理解就是接口的内容一定要尽可能地小，能有多小就多小。我们要为各个类建立专用的接口，而不要试图去建立一个很庞大的接口供所有依赖它的类去调用。

看看下面的代码，我们有一个名为 `Troll` 的类，它实现了一个名为 `Character` 的接口，但是 `Troll` 既不会游泳也不会说话，所以它似乎不太适合实现我们的接口：


```ts
interface Character {
  shoot(): void;
  swim(): void;
  talk(): void;
  dance(): void;
}

class Troll implements Character {
  public shoot(): void {
    // some method
  }
  
  public swim(): void {
    // a troll can't swim
  }

  public talk(): void {
    // a troll can't talk
  }

  public dance(): void {
    // some method
  }
}
```

遵循接口隔离原则，我们删除 `Character` 接口并将它的功能拆分为四个接口，然后我们的 `Troll` 类只需要依赖于我们实际需要的这些接口。

```ts
interface Talker {
  talk(): void;
}

interface Shooter {
  shoot(): void;
}

interface Swimmer {
  swim(): void;
}

interface Dancer {
  dance(): void;
}

class Troll implements Shooter, Dancer {
  public shoot(): void {
    // some method
  }

  public dance(): void {
    // some method
  }
}
```

## 依赖倒置原则（DIP）

> 核心思想：依赖一个抽象的服务接口，而不是去依赖一个具体的服务执行者，从依赖具体实现转向到依赖抽象接口，倒置过来。

看看下面这段代码，我们有一个 `SoftwareProject` 类，它初始化了 `FrontendDeveloper` 和 `BackendDeveloper` 类：

```js
class FrontendDeveloper {
  public writeHtmlCode(): void {
    // some method
  }
}

class BackendDeveloper {
  public writeTypeScriptCode(): void {
    // some method
  }
}

class SoftwareProject {
  public frontendDeveloper: FrontendDeveloper;
  public backendDeveloper: BackendDeveloper;

  constructor() {
    this.frontendDeveloper = new FrontendDeveloper();
    this.backendDeveloper = new BackendDeveloper();
  }

  public createProject(): void {
    this.frontendDeveloper.writeHtmlCode();
    this.backendDeveloper.writeTypeScriptCode();
  }
}
```

遵循依赖倒置原则，我们创建一个 `Developer` 接口，由于 `FrontendDeveloper` 和 `BackendDeveloper` 是相似的类，它们都依赖于 `Developer` 接口。

我们不需要在 `SoftwareProject` 类中以单一方式初始化 `FrontendDeveloper` 和 `BackendDeveloper`，而是将它们作为一个列表来遍历它们，分别调用每个 `develop()` 方法。

```ts
interface Developer {
  develop(): void;
}

class FrontendDeveloper implements Developer {
  public develop(): void {
    this.writeHtmlCode();
  }

  private writeHtmlCode(): void {
    // some method
  }
}

class BackendDeveloper implements Developer {
  public develop(): void {
    this.writeTypeScriptCode();
  }

  private writeTypeScriptCode(): void {
    // some method
  }
}

class SoftwareProject {
  public developers: Developer[];

  public createProject(): void {
    this.developers.forEach((developer: Developer) => {
      developer.develop();
    });
  }
}
```


> 好处：实现模块间的松耦合，更利于多模块并行开发。


## 参考

- https://blog.bitsrc.io/solid-principles-in-typescript-153e6923ffdb
- https://www.zhihu.com/search?type=content&q=SOLID%20%E5%8E%9F%E5%88%99
- https://mp.weixin.qq.com/s/jHrdxu5oQnz2Rn4Uv5OQcw



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
