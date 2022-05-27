---
title: 使用 JavaScript 进行数据分组最优雅的方式
category: JavaScript
date: 2021-12-26
tags:
  - JavaScript
  - 最新提案
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


今天我们一起来看一个数据分组的小技巧。

对数据进行分组，是我们在开发中经常会遇到的需求，使用 `JavaScript` 进行数据分组的方式也有很多种，但是由于没有原生方法的支持，我们自己实现的数据分组函数通常都比较冗长而且难以理解。

不过，告诉大家一个好消息，一个专门用来做数据分组的提案 `Array.prototype.groupBy` 已经到达 `Stage 3` 啦！


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c596a079ed7a4a44abe87bed621ff201~tplv-k3u1fbpfcp-zoom-1.image)


在看这个提案，之前，我们先来回顾下我们以前在 JavaScript 里是怎么分组的。

## 以前的方式

假设我们有下面一组数据：

```js
const items = [
  {
    type: 'clothes',
    value: '👔',
  },
  {
    type: 'clothes',
    value: '👕',
  },
  {
    type: 'clothes',
    value: '👗',
  },
  {
    type: 'animal',
    value: '🐷',
  },
  {
    type: 'animal',
    value: '🐸',
  },
  {
    type: 'animal',
    value: '🐒',
  },
];
```

我们希望按照 `type` 分组成下面的格式：

```js
const items = {
  clothes: [
    {
      type: 'clothes',
      value: '👔',
    },
    {
      type: 'clothes',
      value: '👕',
    },
    {
      type: 'clothes',
      value: '👗',
    },
  ],
  animal: [
    {
      type: 'animal',
      value: '🐷',
    },
    {
      type: 'animal',
      value: '🐸',
    },
    {
      type: 'animal',
      value: '🐒',
    },
  ],
};
```

我们可能会用到下面的写法：

### for 循环

最直接而且容易理解的方法，就是代码有点多。

```js
const groupedBy = {};

for (const item of items) {
  if (groupedBy[item.type]) {
    groupedBy[item.type].push(item);
  } else {
    groupedBy[item.type] = [item];
  }
}
```

### reduce

使用 `Array.protoype.reduce` 虽然语法看起来简单，但是太难读了。

```js
items.reduce(
  (acc, item) => ({
    ...acc,
    [item.type]: [...(acc[item.type] ?? []), item],
  }),
  {},
);
```

我们稍微改造的容易理解一点，语法就跟上面的 `for` 循环差不多了：

```js
items.reduce((acc, item) => {
  if (acc[item.type]) {
    acc[item.type].push(item);
  } else {
    acc[item.type] = [item];
  }

  return acc;
}, {});
```

### filter

使用 `Array.prototype.filter`，代码看起来很容易阅读，但是性能很差，你需要对数组进行多次过滤，而且如果 type 属性值比较多的情况下，还需要做更多的 filter 操作。

```js
const groupedBy = {
  fruit: items.filter((item) => item.type === 'fruit'),
  vegetable: items.filter((item) => item.type === 'vegetable'),
};
```

### 其他

如果你既不想用 `reducer`，还想用到函数式写法，你可能会写出下面的代码：

```js
Object.fromEntries(
  Array.from(new Set(items.map(({ type }) => type))).map((type) => [
    type,
    items.filter((item) => item.type === type),
  ]),
);
```

是不是很让人崩溃 🤯～

## Array.prototype.groupBy

好了，如果使用 `Array.prototype.groupBy`，你只需要下面这一行代码：

```js
items.groupBy(({ type }) => type);
```

groupBy 的回调中一共有三个参数：


- 参数1：数组遍历到的当前对象
- 参数2：index 索引
- 参数3：原数组

```js
const array = [1, 2, 3, 4, 5];

// groupBy groups items by arbitrary key.
// In this case, we're grouping by even/odd keys
array.groupBy((num, index, array) => {
  return num % 2 === 0 ? 'even': 'odd';
});
```

另外，你还可以用 `groupByToMap`，将数据分组为一个 `Map` 对象。

```js
// groupByToMap returns items in a Map, and is useful for grouping using
// an object key.
const odd  = { odd: true };
const even = { even: true };
array.groupByToMap((num, index, array) => {
  return num % 2 === 0 ? even: odd;
});

// =>  Map { {odd: true}: [1, 3, 5], {even: true}: [2, 4] }
```


参考：

- https://github.com/tc39/proposal-array-grouping
- https://www.charpeni.com/blog/array-prototype-group-by-to-the-rescue

如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。