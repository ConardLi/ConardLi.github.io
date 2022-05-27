---
title: 如何实现一个通用的 TypeScript 类型保护？
category: TypeScript
tag: 
- TypeScript
date: 2021-12-14
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



今天我们一起来看一个 `TypeScript` 中一个有趣的知识点 - 鸭子类型（`Duck Typing`）。


## 什么是鸭子类型

鸭子类型是很多面向对象（`OOP`）语言中的常见做法。它的名字来源于所谓的“鸭子测试”：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/090a0fae64984929accaee58379fdcc3~tplv-k3u1fbpfcp-zoom-1.image)


> 当看到一只鸟走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那么这只鸟就可以被称为鸭子。

我们不用关心鸭子的定义是什么，只要符合我们通常意义上的认知，那么他就是这个物体。在 `TypeScript` 中，只要对象符合定义的类型约束，那么我们就可以视为他是。

`鸭子类型` 通常用于需要处理一系列不同数据的代码中，我们可能不知道调用者要传递哪些参数。在一些 `switch` 语句或复杂的 `if/else` 判断中，通常是 `鸭子类型` 可能派上用场的地方。

## 为什么需要鸭子类型

在一些动态语言中，鸭子类型的常见用法就是假设给定值符合我们预期的，你可以先尝试执行一个操作，然后我们再去处理不符合预期的情况下的异常。比如在下面这段 `Python` 代码中：

```python
from typing import Any

def is_duck(value: Any) -> bool:
  try:
    value.quack()
    return True
  except (Attribute, ValueError):
    return False
```

这段代码写的很蠢，不过表达的意思挺明确的，你通过调用传入参数的 `.quack()` 方法检查它是否可以嘎嘎叫，如果它嘎嘎叫了，就返回 `true` ，如果它没有这个方法，异常就会被捕获，则返回 `false`。

在 `Python` 中，`try-except` 是一种常见的写法，它也被很多库（比如`hasattr`）广泛使用。

相比之下，在 `JavaScript` 中，`try-catch` 则存在很多限制 — 你既不能根据抛出异常的原型定义不同的 `catch` 块，也不能确定抛出的到底是不是一个异常实例。

所以，我们在处理异常的时必须更加谨慎，所以在 `JavaScript` 和 `TypeScript` 中我们要做这样的判断可能有点逆向思维。通常的做法可能是这样的：

```js
function isDuck(value) {
    return !!(
        value &&
        typeof value === 'object' &&
        typeof Reflect.get(value, 'quack') === 'function'
    );
}
```

在上面的函数中，我们做了下面几个判断：

- 检查参数 `value` 是不是为空
- 检查参数 `value` 是否为 `object` 类型
- 通过 `Reflect.get` 方法更安全安全地判断 `quack` 是不是一个函数


你可能对这种代码再熟悉不过了，毕竟在 `JavaScript` 代码里这种布尔判断遍地都是。

如果用 `TypeScript` 的话写法可能就不一样了，参数 `value` 可能是只鸭子，但 `IDE` 和 `JavaScript` 解析器都不知道鸭子是啥。在 `TypeScript` 中，我们可以把鸭子定义成一个类型：


```ts
interface Duck {
    quack(): string;
}

interface Cat {
    miao(): string;
}


function isDuck(value: Cat | Duck) {
    return !!(
        value &&
        typeof value === 'object' &&
        typeof value.quack === 'function'
    );
}
```

这里我们在参数 `value` 的类型中告诉 `TypeScript` 解析器，它可能是只鸭子也可能是只猫，你需要再函数体的逻辑中再做进一步判断。

但是，解析器可能没我们想象中的那么聪明，这里会报错，因为他还是不能确定 `value` 到底是只鸭子还是只猫，所以无法确定 `quack` 函数是不是存在。

下面的写法就可以帮我们解决这个问题：

```ts
interface Duck {
    quack(): string;
}

function isDuck(value: unknown): value is Duck {
    return !!(
        value &&
        typeof value === 'object' &&
        typeof value.quack === 'function'
    );
}
```

注意，`isDuck` 的返回值类型中使用了 `is` 关键字，这在 `TypeScript` 中被叫做类型谓词（`type predicates`），类型谓词是一个返回布尔值的函数，可以用来做类型保护；

> 类型保护是可执行运行时检查的一种表达式，用于确保该类型在一定的范围内。换句话说，类型保护可以保证一个字符串是一个字符串，尽管它的值也可以是一个数字。

实际上它就是告诉 `TypeScript` 编译器给定的值是就是我们给定的那个类型。

> 简单的说，就是告诉编译器这个可能是鸭子的东西就是一只鸭子。


## 用法示例 recursiveResolve

鸭子类型的一个方便用法是当你的代码可能接受 `Promise` 或者 `非Promise` 时来帮我们进行更优雅的判断。

假设我们创建了一个自定义方法来递归遍历对象，解析可能嵌套在里面的任何 `Promise`，下面就是一个很好的用法：

```ts

function isRecord<T = any>(value: unknown): value is Record<string | symbol, T> {
    return !!(value && typeof value === 'object');
}

function isPromise<T = unknown>(value: unknown): value is Promise<T> {
    return isRecord(value) && Reflect.has(value, 'then');
}

async function recursiveResolve<T>(
    parsedObject: Record<string, any>,
): Promise<T> {
    const output = {};
    for (const [key, value] of Object.entries(parsedObject)) {
        const resolved: unknown = isPromise(value) ? await value : value;
        if (isRecord(resolved)) {
            Reflect.set(output, key, await recursiveResolve(resolved));
        } else {
            Reflect.set(output, key, resolved);
        }
    }
    return output as T;
}
```

我们在上面定义了两个类型谓词 - `isPromiseand`、`isRecord`，它们都接受一个可选的泛型参数，这样它们就能被复用。然后我们就可以在 `recursiveResolve` 函数中使用它们了，并且开销是很小的，在整个函数中都能正确推断输入。


## 小技巧 - 通用类型保护

上面的判断可能在我们的代码中是个很常见的用法，如果我们需要判断的类型有很多，为每个类型都实现一个这样的类型保护函数还挺麻烦的，所以我们可以稍微做个变形来封装一个更通用的类型保护函数：

```ts
export const isOfType = <T>(
  varToBeChecked: any,
  propertyToCheckFor: keyof T
): varToBeChecked is T =>
  (varToBeChecked as T)[propertyToCheckFor] !== undefined;
```

你可以向这样用：

```js
interface code秘密花园 {
    好文章: string;
}

if (isOfType<code秘密花园>(公众号, '好文章')) {
  console.log('这里有好文章，这里是code秘密花园!');
} else {
  console.log("这里不是code秘密花园！");
}
```

##  参考

- https://javascript.plainenglish.io/what-is-duck-typing-in-typescript-c537d2ff9b61
- https://rangle.io/blog/how-to-use-typescript-type-guards/



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
