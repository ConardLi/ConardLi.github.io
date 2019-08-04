---
title: React中key的正确使用方式
date: 2018-11-27 01:50:45
tags:
     - React
---


![image](https://www.lisq.xyz/img/5.jpg)


![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/key1.png)

在开发react程序时我们经常会遇到这样的警告，然后就会想到：哦！循环子组件忘记加key了～

出于方便，有时候会不假思索的使用循环的索引作为key，但是这样真的好吗？什么样的值才是key的最佳选择？

为了弄明白，本文将从三个方面来分析"key"：

1.为什么要使用key

2.使用index做key存在的问题

3.正确的选择key


## 1.为什么要使用key


react官方文档是这样描述key的：

> Keys可以在DOM中的某些元素被增加或删除的时候帮助React识别哪些元素发生了变化。因此你应当给数组中的每一个元素赋予一个确定的标识。

react的diff算法是把key当成唯一id然后比对组件的value来确定是否需要更新的，所以如果没有key，react将不会知道该如何更新组件。

你不传key也能用是因为react检测到子组件没有key后，会默认将数组的索引作为key。

react根据key来决定是销毁重新创建组件还是更新组件，原则是：

- key相同，组件有所变化，react会只更新组件对应变化的属性。
- key不同，组件会销毁之前的组件，将整个组件重新渲染。


## 2.使用index做key存在的问题


### 2.1 受控组件

单纯的展示组件比如span，这些组件是受控组件，意味着他们的值将是我们给定好的。

如果子组件只是受控组件，使用index作为key，可能表面上不会有什么问题，实际上性能会受很大的影响。例如下面的代码：

```html
// ['张三','李四','王五']=>
<ul>
    <li key="0">张三</li>
    <li key="1">李四</li>
    <li key="2">王五</li>
</ul>
// 数组重排 -> ['王五','张三','李四'] =>
<ul>
    <li key="0">王五</li>
    <li key="1">张三</li>
    <li key="2">李四</li>
</ul>
```

当元素数据源的顺序发生改变时，对应的：

key为0，1，2的组件都发生了变化，三个子组件都会被重新渲染。（这里的重新渲染不是销毁，因为key还在）

相反，我们使用唯一id作为key：

```html
// ['张三','李四','王五']=>
<ul>
    <li key="000">张三</li>
    <li key="111">李四</li>
    <li key="222">王五</li>
</ul>
// 数组重排 -> ['王五','张三','李四'] =>
<ul>
    <li key="222">王五</li>
    <li key="000">张三</li>
    <li key="111">李四</li>
</ul>
```

根据上面的更新原则，子组件的值和key均未发生变化，只是顺序发生改变，因此react只是将他们做了移动，并未重新渲染。


### 2.2 非受控组件

像input这样可以由用户任意改变值，不受我们控制的组件，在使用了index作为key时可能会发生问题，看如下的栗子：

子组件：

```js
  render() {
    return (
      <div>
        <p >值：{this.props.value}</p>
        <input />
      </div>
    );
  }
}
```

父组件
```js
{
this.state.data.map((element, index) => {
    return <Child value={element} key={index} />
    })
}
```

我们在前两个输入框分别输入对应的值：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/key2.png)

然后在头部添加一个元素：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/key3.png)


很明显，这个结果并不符合我们的预期，我们来分析一下发生了什么：

```html
<div key="0">
    <p >值：0</p>
    <input />
</div>
<div key="1">
    <p >值：1</p>
    <input />
</div>
<div key="2">
    <p >值：2</p>
    <input />
</div>
```

变化后：

```html
<div key="0">
    <p >值：5</p>
    <input />
</div>
<div key="1">
    <p >值：0</p>
    <input />
</div>
<div key="2">
    <p >值：1</p>
    <input />
</div>
<div key="3">
    <p >值：2</p>
    <input />
</div>
```

可以发现：key 0，1，2并没有发生改变，根据规则，不会卸载组件，只会更新改变的属性。

react只diff到了p标签内值的变化，而input框中的值并未发生改变，因此不会重新渲染，只更新的p标签的值。

当使用唯一id作为key后：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/key5.png)


```html
<div key="000">
    <p >值：0</p>
    <input />
</div>
<div key="111">
    <p >值：1</p>
    <input />
</div>
<div key="222">
    <p >值：2</p>
    <input />
</div>
```

变化后：

```html
<div key="555">
    <p >值：5</p>
    <input />
</div>
<div key="000">
    <p >值：0</p>
    <input />
</div>
<div key="111">
    <p >值：1</p>
    <input />
</div>
<div key="222">
    <p >值：2</p>
    <input />
</div>
```

可以很明显的发现：key为 111，222，333的组件没有发生任何改变，react不会更新他们，只是新插入了子组件555，并改变了其他组件的位置。

## 3.正确的选择key

### 3.1 纯展示

如果组件单纯的用于展示，不会发生其他变更，那么使用index或者其他任何不相同的值作为key是没有任何问题的，因为不会发生diff，就不会用到key。

### 3.2 推荐使用index的情况

并不是任何情况使用index作为key会有缺陷，比如如下情况：

你要分页渲染一个列表，每次点击翻页会重新渲染：

使用唯一id：

```html
第一页
<ul>
    <li key="000">张三</li>
    <li key="111">李四</li>
    <li key="222">王五</li>
</ul>
第二页
<ul>
    <li key="333">张三三</li>
    <li key="444">李四四</li>
    <li key="555">王五五</li>
</ul>
```
翻页后，三条记录的key和组件都发生了改变，因此三个子组件都会被卸载然后重新渲染。

使用index：

```html
第一页
<ul>
    <li key="0">张三</li>
    <li key="1">李四</li>
    <li key="2">王五</li>
</ul>
第二页
<ul>
    <li key="0">张三三</li>
    <li key="1">李四四</li>
    <li key="2">王五五</li>
</ul>
```

翻页后，key不变，子组件值发生改变，组件并不会被卸载，只发生更新。

### 3.3 子组件可能发生变更/使用了非受控组件

大多数情况下，使用唯一id作为子组件的key是不会有任何问题的。

这个id一定要是唯一，并且稳定的，意思是这条记录对应的id一定是独一无二的，并且永远不会发生改变。

不推荐使用math.random或者其他的第三方库来生成唯一值作为key。

因为当数据变更后，相同的数据的key也有可能会发生变化，从而重新渲染，引起不必要的性能浪费。

如果数据源不满足我们这样的需求，我们可以在渲染之前为数据源手动添加唯一id，而不是在渲染时添加。


