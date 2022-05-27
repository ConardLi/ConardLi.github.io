---
title: 太卷了！浏览器也支持原生的深拷贝API了？
category: JavaScript
date: 2021-12-21
tags:
  - JavaScript
  - 最新提案
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


今天来聊一个前端老生常谈的话题，深拷贝。

在以前，由于浏览器并未对这个能力提供原生支持，所以它经常出现在 `手写XXX` 这样的面试题中，我之前也为它专门写过一篇文章：

[如何写出一个惊艳面试官的深拷贝](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490151&idx=1&sn=ba6b57ca70ad91d3e48aacc8e9019604&chksm=c2e2ef4cf595665a43cf7c0cc203f9b4cd9ac1529e8e8dfad076429a02c40ae959c1dbcc3c14&token=254251558&lang=zh_CN#rd)

不过，我们成功的把浏览器给卷了，现在它给我们提供了一个原生的深拷贝 API： `structuredClone`。


## 浅拷贝

再看深拷贝之前，我们还是先来简单回顾一下浅拷贝和深拷贝的区别（不要嫌我啰嗦，主要为了照顾新手同学，如果有基础的同学直接跳过）。

- 浅拷贝：创建一个新对象，这个对象有着原始对象属性值的一份精确拷贝。如果属性是基本类型，拷贝的就是基本类型的值，如果属性是引用类型，拷贝的就是内存地址 ，所以如果其中一个对象改变了这个地址，就会影响到另一个对象。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1abb5b3c60f641f6b2719cafc19d1e8e~tplv-k3u1fbpfcp-zoom-1.image)

- 将一个对象从内存中完整的拷贝一份出来,从堆内存中开辟一个新的区域存放新对象,且修改新对象不会影响原对象。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9384cc99d2354606932ef4a6b4030410~tplv-k3u1fbpfcp-zoom-1.image)

在代码里我们复制一个对象可能用的最多的就是扩展运算符 `...`，这就是一种浅拷贝。

```js
const myOriginal = {
  someProp: "code秘密花园",
  anotherProp: {
    withAnotherProp: 1,
    andAnotherProp: true
  }
};

const myShallowCopy = {...myOriginal};
```

我们直接在浅拷贝对象上添加或更改属性只会影响拷贝副本，而不会影响原始值：

```js
myShallowCopy.aNewProp = "ConardLi";
console.log(myOriginal.aNewProp)
// ^ logs `undefined`
```

如果我们更改之前的引用对象属性，副本和原始值双方都会影响：

```js
myShallowCopy.anotherProp.aNewProp = "ConardLi";
console.log(myOriginal.anotherProp.aNewProp) 
// ^ logs `ConardLi`
```

本质上，就是拷贝对原始类型（`string、number、bigint、boolean、undefined、symbol、null`）和引用类型（`object`、`array` 等）的处理不一样，这俩的区别，可以看看这篇文章，这里就不过多展开了。

[【JS进阶】你真的掌握变量和类型了吗](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490086&idx=1&sn=7b8e1ce02fd03547fee3c3ac3d35bac1&chksm=c2e2ef0df595661be8f4a9a356896f3eeabc5bed35f68d255885df1fec30f7266b6b9954dd41&token=254251558&lang=zh_CN#rd)


## 深拷贝


与浅拷贝相对的就是深拷贝，深拷贝算法也会一个一个地拷贝一个对象的属性，但是当它拷贝对另一个对象的引用时会递归调用，同时创建该引用类型的一个副本，这可以有效避免我们在代码里共享一个意想不到的对象引用。

在以前，我们需要依赖一些第三方库来实现深拷贝，比如 `Lodash` 的 `cloneDeep()` 函数，或者可能大多数人用的基于是 `JSON` 的 `hack` ：

```js
const myDeepCopy = JSON.parse(JSON.stringify(myOriginal));
```

但是这种方法缺点很多：

- 循环引用：`JSON.stringify()` 的对象中如果有循环引用会抛出异常 `Converting circular structure to JSON`。
- 其他数据类型：`JSON.stringify()` 无法拷贝 `Map、Set、RegExp` 这些特殊数据类型。
- 函数：`JSON.stringify()` 会默认移除函数。


## structuredClone

现在，`structuredClone API` 已经成为了一个 `HTML` 规范中的标准提案，用它可以轻松实现一个深拷贝，并且也默认解决了循环引用等问题、支持了很多默认的数据类型。

```js
// Create an object with a value and a circular reference to itself.
const original = { name: "MDN" };
original.itself = original;

// Clone it
const clone = structuredClone(original);

console.assert(clone !== original); // the objects are not the same (not same identity)
console.assert(clone.name === "MDN"); // they do have the same values
console.assert(clone.itself === clone); // and the circular reference is preserved

```

并且，相比 `JSON.parse()` ，`structuredClone API` 的性能更好，特别是在处理一些更大复杂的对象的时候，所以我们可以用它来作为代码里深拷贝的默认方法啦，为了兼容性考虑，可以用 `JSON.stringify` 或者其他工具函数作为备用。


不过，这个 API 也并不完美，它也有些缺点：

- 原型：无法拷贝对象的原型链。
- 函数：无法拷贝函数。
- 不可克隆：并没有支持所有类型的拷贝，比如 `Error`。

当然，大部分实际的需求场景中，我们没必要拷贝这些东西，估计这些也就只能出现在面试题里面了。。。先看怎么做的话，还是可以回去看我这篇文章：[如何写出一个惊艳面试官的深拷贝](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490151&idx=1&sn=ba6b57ca70ad91d3e48aacc8e9019604&chksm=c2e2ef4cf595665a43cf7c0cc203f9b4cd9ac1529e8e8dfad076429a02c40ae959c1dbcc3c14&token=254251558&lang=zh_CN#rd)


## 兼容性


目前，主流浏览器（`Chrome、Firefox、Safari`）都已经在 `release` 版本支持了这个 `API`，`Firefox` 也已经在其 94 稳定版本支持了，另外，`Node 17` 和 `Deno 1.14` 也已经实现了这个 API，你可以放心大胆的用了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ae55862349244598fc4deb5d0aa159f~tplv-k3u1fbpfcp-zoom-1.image)

## 参考

- https://caniuse.com/?search=structuredClone
- https://web.dev/structured-clone/



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。