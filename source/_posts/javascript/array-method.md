---
title: JavaScript 数组新增 4 个方法！
category: JavaScript
tag: 
- JavaScript
- 最新提案
date: 2022-04-17	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


今天聊 `JavaScript` 的最新提案，这是我 [最新技术提案](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0MDMwMzQyOA==&action=getalbum&album_id=2160512849633148933#wechat_redirect) 专栏的第 16 篇文章了，感谢读者们一如既往的支持！

开门尖山，`JavaScript` 数组即将新增 4 个新的非破坏性方法：

- .toReversed()
- .toSorted()
- .toSpliced()
- .with()


## Change Array by copy 提案



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da258310464f4b5ca894cd8f3759e039~tplv-k3u1fbpfcp-zoom-1.image)

这四个方法来源于新的 `Change Array by copy` 提案，目前已经处于 [stage3阶段](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490745&idx=1&sn=10e1de133640bfb9978a8a65b4f09d8b&chksm=c2e2e992f595608411dafd9cfb7f0bc3ac2cf70e100a56bf1565d21c5bbe1b751e805a47fa5d&token=1966800687&lang=zh_CN#rd)，意味着基本上不会再有太大变化了，我们即将在各大浏览器里看到它们的实现。

提案地址：https://github.com/tc39/proposal-change-array-by-copy


## 数组的破坏性和非破坏性

为啥这个提案叫 `Change Array by copy` 呢？字面意思就是从副本里改变数组。

这就要说起数组的破坏性和非破坏性方法了：

有些数组的方法我们在调用的时候不会改变原始的数组，我们称它们为非破坏性方法，比如我们经常用到的 `filter、some、map、find` 等方法，斗是不会改变原数组的：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9858e1be06d64c00998921c4d2acc137~tplv-k3u1fbpfcp-zoom-1.image)

但是，另外有一些方法是会改变原数组本身的，比如：`sort、reverse、splice` 等方法。 


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f88b6c4c9f04482ac65313473d37fdd~tplv-k3u1fbpfcp-zoom-1.image)

可以看到，原数组和排序后得到的新数组是一样的，说明这个方法改变了原数组。很多时候我们想用这些方法，但是又不想改变原数组，我们可能会先创建一个副本，比如下面这些操作：

```js
const sorted1 = array1.slice().sort();
const sorted2 = [...array1].sort();
const sorted3 = Array.from(array1).sort();
```

几个数组的新方法，就是用来解决这样的问题的。

## toSorted()

`.toSorted()` 是 `.sort()` 的非破坏性版本：

```js
const array = ['c', 'o', 'n', 'a', 'r', 'd', 'l', 'i'];
const result = array.toSorted();
console.log(result); //  ['a', 'c', 'd', 'i', 'l', 'n', 'o', 'r']
console.log(array); // ['c', 'o', 'n', 'a', 'r', 'd', 'l', 'i']
```

下面是个简单的 `polyfill`：

```js
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function (compareFn) {
    return this.slice().sort(compareFn);
  };
}

```

## toReversed()

`.toReversed()` 是 `.reverse()` 的非破坏性版本：

```js
const array = ['c', 'o', 'n', 'a', 'r', 'd', 'l', 'i'];
const result = array.toReversed();
console.log(result); //  ['i', 'l', 'd', 'r', 'a', 'n', 'o', 'c']
console.log(array); // ['c', 'o', 'n', 'a', 'r', 'd', 'l', 'i']
```

下面是个简单的 `polyfill`：

```js
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function () {
    return this.slice().reverse();
  };
}
```

## with()

`with()` 是对数组的某个元素赋值操作的非破坏性版本，比如下面的操作：

```js
array[index] = value
```

如果我们只是想得到一个新数组，又不想改变原数组，可以这样用：

```js
const array = ['c', 'o', 'n', 'a', 'r', 'd', 'l', 'i'];
const result = array.with(0, 'ConardLi')
console.log(result); //  ['ConardLi', 'o', 'n', 'a', 'r', 'd', 'l', 'i'];
console.log(array); // ['c', 'o', 'n', 'a', 'r', 'd', 'l', 'i']
```

下面是个简单的 `polyfill`：

```js
if (!Array.prototype.with) {
  Array.prototype.with = function (index, value) {
    const copy = this.slice();
    copy[index] = value;
    return copy;
  };
}
```


## toSpliced()

`.splice(start, deleteCount, ...items)` 方法比其他几个破坏性方法更复杂点：

- 它从 start 开始删除 deleteCount 个元素 ；
- 然后把 items 插入到被删除的位置；
- 最后返回已删除的元素。

```js
const array = [1, 2, 3, 4, 5, 6];
const result = array.splice(1, 2, 0);
console.log(result); //  [2, 3]
console.log(array);  // [1, 0, 4, 5, 6]
```

`.tospliced()` 是 ``.splice()`` 的非破坏性版本，它会返回原数组变更后的版本，因此我们拿不到被删除的元素：

```js
const array = [1, 2, 3, 4, 5, 6];
const result = array.tospliced(1, 2, 0);
console.log(result); //  [1, 0, 4, 5, 6]
console.log(array);  // [1, 2, 3, 4, 5, 6]
```

下面是个简单的 `polyfill`：

```js
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (start, deleteCount, ...items) {
    const copy = this.slice();
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}
```

## polyfill

提案目前还在 [stage3阶段](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490745&idx=1&sn=10e1de133640bfb9978a8a65b4f09d8b&chksm=c2e2e992f595608411dafd9cfb7f0bc3ac2cf70e100a56bf1565d21c5bbe1b751e805a47fa5d&token=1966800687&lang=zh_CN#rd)，在生产使用最好使用 `polyfill`：

https://github.com/tc39/proposal-change-array-by-copy/blob/main/polyfill.js


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
