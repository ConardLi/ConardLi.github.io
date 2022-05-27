---
title: JavaScript 中的管道运算符
category: JavaScript
tag:
- 最新提案
- JavaScript
date: 2022-05-17
---

 大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。
 
今天来给大家介绍 `JavaScript` 代码的一个新运算符：管道运算符 `|>`。

 ## 对一个值执行连续操作
 
 
当我们在 `JavaScript` 中对一个值执行连续操作（例如函数调用）时，目前有两种基本方式：

- 将值作为参数传递给具体操作（如果有多个操作，则嵌套操作），例如：`three(two(one(value)))`；
- 将函数作为值上的方法调用（如果有多个方法，则为链式调用），例如：`value.one().two().three()`。
 
在 `2020` 年 `JS` 状态调查中，“你认为 `JavaScript` 目前缺少什么？“ 问题中，`希望拥有管道操作符` 答案排行第四名。
 
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0d69902f87eb48978d3249d67d5c14a8~tplv-k3u1fbpfcp-zoom-1.image)

看来大家当前对 JS 中连续操作的写法还是不太满意啊。

首先，如果是嵌套写法的话，简单的嵌套还好，但是当嵌套变得很深的时候就有点难以阅读了。嵌套的执行流程是从右到左移动的，而不是我们正常阅读代码从左到右的方向。另外，我们在很多括号之间找到一个位置添加一些参数也比较困难。比如下面的代码：

```js
console.log(
  chalk.dim(
    `$ ${Object.keys(envars)
      .map(envar =>
        `${envar}=${envars[envar]}`)
      .join(' ')
    }`,
    'node',
    args.join(' ')));
```

对于链式调用，只有我们把方法指定为值的实例方法时才能用，这让它具有很大的局限性。当然，如果你的库设计的很好（比如 `jQuery`） 还是挺好用的。

## 管道式编程

`Unix` 操作系统有一个管道机制，可以把前一个操作的值传给后一个操作。这个机制非常有用，使得简单的操作可以组合成为复杂的操作。许多语言都有管道的实现，举个简单的例子：

```js
function capitalize (str) {
  return str[0].toUpperCase() + str.substring(1);
}
function hello (str) {
  return str + ' Hello!';
}
```

上面是两个简单的函数，想要嵌套执行，传统写法和管道写法分别如下：

```js
// 传统的写法
exclaim(hello('conardli'))
// "Conardli Hello!"

// 管道的写法
'conardli'
  |> capitalize
  |> hello
// "Conardli Hello!"
```
 
 ## 两个互相竞争的提案
 
关于管道运算符，目前在 `ES` 中有两个相互竞争的提案：


`Microsoft` 提出的 `F#` ：是一种函数式编程语言，其核心基于 `OCaml`，这个运算符可以很方便的写出柯里化风格的代码。

`Meta` 提出的 `Hack`：大致是 `PHP` 的静态类型版本。这个管道运算符专注于柯里化函数以外的语言特性。

目前来看，`Meta` 提出的 `Hack` 应该更收社区的欢迎，`Microsoft` 提出的 `F#` 已经多次被 `TC39` 打回去了。不过不用担心，`F#` 的优势后续也可能会引入 `Hack` 中。

下面我们分别来看看两个提案的用法吧。

## Hack 管道运算符

下面是一个 `Hack` 管道运算符 `|>` 的简单示例：

```js
'ConardLi' |> console.log(%)  // ConardLi
```

管道运算符 `|>` 的左侧是一个表达式，它被计算并成为特殊变量 `%` 的值。我们可以在右侧使用该变量。返回右侧的执行结果。前面的例子等价于：

```js
console.log('ConardLi') // ConardLi
```

下面还有一些和其他写法配合的例子：

```js
value |> someFunction(1, %, 3) // function calls
value |> %.someMethod() // method call
value |> % + 1 // operator
value |> [%, 'b', 'c'] // Array literal
value |> {someProp: %} // object literal
value |> await % // awaiting a Promise
value |> (yield %) // yielding a generator value
```

下面我们再来看个更复杂点的例子，一个嵌套函数调用：

```js
const y = h(g(f(x)));
```

`Hack pipe` 操作符可以让我们更好地表达这段代码的意思：

```js
const y = x |> f(%) |> g(%) |> h(%);
```

这段代码更符合我们常规的编码思想，代码从左到右依次执行：`f、g、h`


## F# 管道运算符

`F#` 管道运算符与 `Hack` 管道运算符大致相似。但是，它没有特殊变量 `%`。相反，运算符右侧的函数并会直接应用于其左侧。因此，以下两个表达式是等价的：
 
```js
'ConardLi' |> console.log

console.log('ConardLi')
```

因此 `F#` 管道运算符更适合单参数的函数，下面三个函数是等价的：

```js
const y = h(g(f(x))); // no pipe
const y = x |> f(%) |> g(%) |> h(%); // Hack pipe
const y = x |> f |> g |> h; // F# pipe
```

在这种情况下，`Hack pipe` 比 `F# pipe` 更冗长。

但是，如果是多参数的情况下，`F# pipe` 的写法就要复杂一点了：

```js
5 |> add2(1, %) // Hack pipe
5 |> $ => add2(1, $) // F# pipe
```

可以看到，`F# pipe` 还要多写一个匿名函数，这显然相对与 `Hack pipe` 来讲缺失了一些灵活性。这可能也是大家更倾向于 `Hack pipe` 的原因。
 
 ## 管道运算符的一些实际用例
 
 
### 嵌套函数调用的扁平写法

`JavaScript` 标准库创建的所有迭代器都有一个共同的原型。这个原型是不能直接访问的，但我们可以像这样检索它： 

```js
const IteratorPrototype =
  Object.getPrototypeOf(
    Object.getPrototypeOf(
      [][Symbol.iterator]()
    )
  )
;
```

使用管道运算符，代码会更容易理解一些：

```js
const IteratorPrototype =
  [][Symbol.iterator]()
  |> Object.getPrototypeOf(%)
  |> Object.getPrototypeOf(%)
;
```

### 后期处理

看看下面的代码：

```js
function myFunc() {
  // ···
  return conardLi.someMethod();
}
```

如果现在我们想在函数返回前对返回值做一些其他的操作，我们应该怎么办呢？

在以前我们肯定要定义一个临时变量或者在函数外侧再包一个函数，使用管道运算符，我们可以这样做：

```js
function myFunc() {
  // ···
  return theResult |> (console.log(%), %); // (A)
}
```

在下面的代码中，我们后处理的值是一个函数 — 我们可以向它添加一个属性：

```js
const testPlus = () => {
  assert.equal(3+4, 7);
} |> Object.assign(%, {
  name: 'Test the plus operator',
});
```

前面的代码等价于：
```js
const testPlus = () => {
  assert.equal(3+4, 7);
}
Object.assign(testPlus, {
  name: 'Testing +',
});
```

我们也可以像这样使用管道运算符：

```js
const testPlus = () => {
  assert.equal(3+4, 7);
}
|> (%.name = 'Test the plus operator', %)
;
```

### 链式函数调用

我们可以用 Array 的一些方法例如 `.filter()`和 `.map()` 实现链式调用，但是这仅仅是内置在数组里的一些方法，我们没办法通过库引入更多的 `Array` 方法。

使用管道运算符，我们可以像数组本身的方法一样实现一些其他方法的链式调用：

```js
import {Iterable} from '@rauschma/iterable/sync';
const {filter, map} = Iterable;

const resultSet = inputSet
  |> filter(%, x => x >= 0)
  |> map(%, x => x * 2)
  |> new Set(%)
;
```


最后再回来看看标题的代码：

```js
const regexOperators =
  ['*', '+', '[', ']']
  .map(ch => escapeForRegExp(ch))
  .join('')
  |> '[' + % + ']'
  |> new RegExp(%)
;
```

实际上就等价于

```js
let _ref;

const regexOperators =
  (
    (_ref = ['*', '+', '[', ']']
      .map(ch => escapeForRegExp(ch))
      .join('')), 
    new RegExp(`[${_ref}]`)
  );

```

和引入中间变量相比，管道运算符是不是更易于阅读且简洁呢。


## 参考

- https://github.com/tc39/proposal-pipeline-operator
- https://2ality.com/2022/01/pipe-operator.html


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。