---
title: 写好 JSX 条件语句的几个建议
category: React
tag: 
- React
- 最佳实践
date: 2022-01-24	
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。
 

很多模版语言的框架（比如`Vue、Angular`）都会内置一些条件语法，比如 `ng-if、v-if` 等，但是在 `React` 的 `JSX` 里面，没有这样的指令，它提供给我们更灵活的选择，但是这种灵活也会带来很多问题，我们今天一起来看几个避免这些问题的建议。


## 小心 0


如果我们渲染的是一个列表，可能列表里的数据不为空的时候我们才会进行渲染，我们可能会写出下面的判断代码：

```jsx
{data.length && <div>{data.map((d) => d)}</div>}
```


但是，如果 `data` 数组是空的，我们会在界面上看到一个 `0`。




![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b742488a1e0d43a89855d4b40840519e~tplv-k3u1fbpfcp-zoom-1.image)


在 `JavaScript` 中，布尔运算符不会把它们的运算结果转换为布尔值，另外这和 `&&` 的工作方式有关系，如果左边是个假值（比如 `0` 就是个假值），会立刻被返回，然后 `React` 会将这个 `0` 放入 `DOM` 中，如果是布尔值（比如`false`）就不会。


如果你要使用 `&&` ，永远让左侧的值是个 `Boolean` 值：

```js
data.length > 0 && jsx

!!data.length && jsx

Boolean(data.length) && jsx
```

你也可以用三元运算符：

```js
{data.length ? <div>{data.map((d) => d)}</div> : null}
```

## 注意优先级

`&&` 运算符比 `||` 具有更高的优先级，这就意味着你得小心处理同时包含这两种运算符的 `jsx` 语句：

你可能会写出下面的代码：

```jsx
data.a || data.b && <div className="error" />
```

这样写就错了，上面的代码实际上等价于：

```jsx
data.a || (data.b && <div className="error" />)
```

根据以前的经验，如果你的代码里有用到 `||` ，就建议将条件用括号括起来：

```jsx
(data.a || data.b) && <div className="error" />
```


## 三运算符嵌套地狱

三元运算符可以帮助我们很好的切换两个 `JSX`，但是一旦超过两个，你的逻辑很快就会进入嵌套地狱：

```jsx
{isEmoji
    ? <EmojiButton />
    : isCoupon
        ? <CouponButton />
        : isLoaded && <ShareButton />}
```


你可能想把它用 `&&` 重构一下，但是也会有一些重复的判断条件：

```jsx
{isEmoji && < EmojiButton /> } 
{isCoupon && < CouponButton /> } 
{!isEmoji && !isCoupon && isLoaded && < ShareButton /> }
```


这时候，回到原始的 `if / else` 是个不错的选择，建议封装个函数：

```jsx
const getButton = () => {
    if (isEmoji) return <EmojiButton />;
    if (isCoupon) return <CouponButton />;
    return isLoaded ? <ShareButton /> : null;
};
```



## 不要用 JSX 用作判断条件

通过 `props` 传递的 `React` 元素能不能用作条件判断呢，看看下面这个例子：


```js
const Wrap = (props) => {
    if (!props.children) return null;
    return <div>{props.children}</div>
};
```

最好不要这样做，因为 `props.children` 可能有几种不同的情况。

`props.children` 可能是一个空数组，例如 `<Wrap>{[].map(e => <div />)}</Wrap>`。

那用 `children.length` 来判断？也不严谨，因为 `children` 也可能是单个元素：`<Wrap><div /></Wrap>`。


`React.Children.count(props.children)` 支持单个和多个 `children`，但是，你可能会认为 `<Wrap>{false && 'hi'}{false && 'there'}`</Wrap> 包含两个个元素，而实际上不是。


我们再来试试通过 `React.Children.toArray(props.children)` 删除无效的节点，例如 `false`。但对于一个空片段，仍然是正确的：`<Wrap><></><Wrap>`。


所以，为了避免出错，最好还是不要用了 ...

## 重新挂载还是更新？

使用用单独的三元运算符分支编写的 `JSX` 感觉就像是完全独立的代码：

```js
{hasItem ? <Item id={1} /> : <Item id={2} />}
```

你觉得 `hasItem` 变化时会发生啥？我的猜测是首先 `<Item id={1} />`卸载，然后 `<Item id={2} />` 装载，因为我写了两个个单独的 JSX 标签。

然而，`React` 并不知道也不关心我写了啥，它所看到的只是 `Item` 相同位置的元素，所以它依然会保留挂载的实例，然后更新 `props`。上面的代码实际上等价于 `<Item id={hasItem ? 1 : 2} />`。

> 当分支包含不同的组件时，比如 `{hasItem ? <Item1 /> : <Item2 />}`，`React` 会重新挂载，因为 `Item1` 无法更新为 `Item2` 。

上面的情况可能问题不大，管理好状态就好，可能比重新装载性能还好。

但是，如果是非受控组件，可能问题就大了：

```jsx
{mode === 'name'
    ? <input placeholder="name" />
    : <input placeholder="phone" />}
```

如果 `mode` 属性变化了，你会发现之前在 `name` 输入框输入的信息还在 ...

通常的解决方案是使用 `key`，它会告诉 `React` 这是两个完全不一样的元素：

```jsx
// remounts on change
{mode === 'name'
    ? <input placeholder="name" key="name" />
    : <input placeholder="phone" key="phone" />}
```


或者，使用 `&&` 替代三元运算符可能会更清晰一点：

```jsx
{mode === 'name' && < input  placeholder = "name" /> } 
{mode !== 'name' && < input  placeholder = "phone" /> }
```

相反，如果你在同一个逻辑元素上的条件 `props` 不太一样，你可以将条件分支拆分为两个单独的 `JSX` 标签来提高可读性：

```jsx
// messy
<Button
    aria-busy={loading}
    onClick={loading ? null : submit}
>
    {loading ? <Spinner /> : 'submit'}
</Button>
// maybe try:
{loading
    ? <Button aria-busy><Spinner /></Button>
    : <Button onClick={submit}>submit</Button>}
// or even
{loading && <Button key="submit" aria-busy><Spinner /></Button>}
{!loading && <Button key="submit" onClick={submit}>submit</Button>}
// ^^ bonus: _move_ the element around the markup, no remount
```

## 总结

- `{number && <JSX />}` 会把0渲染出来，可以改为 `{number > 0 && <JSX />}`。
- 时刻记得 `||` 条件周围的括号： `{(cond1 || cond2) && <JSX />}`
- 三元运算符不要扩展到超过 2 个分支，建议使用 `if / else`，重构
- 不要使用 `props.children` 进行条件判断
- `{condition ? <Tag props1 /> : <Tag props2 />}` 不会重新挂载 `Tag` 组件，如果你想重新挂载，请使用唯一 `key` 或单独的 `&&` 分支。
- 参考：https://thoughtspile.github.io/2022/01/17/jsx-conditionals/






如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。