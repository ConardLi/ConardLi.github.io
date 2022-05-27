---
title: 详解新的沙箱机制 ShadowRealm API
category: JavaScript
tag: 
- JavaScript
- 最新提案
date: 2022-04-10	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

今天我们来看一个进入 `statge3` 的新的 `JavaScript` 提案：`ShadowRealm API`。

## JavaScript 的运行环境

领域（`realm`），这个词比较抽象，其实就代表了一个 `JavaScript` 独立的运行环境，里面有独立的变量作用域。

比如下面的代码：

```html
<body>
  <iframe>
  </iframe>
  <script>
    const win = frames[0].window;
    console.assert(win.globalThis !== globalThis); // true
    console.assert(win.Array !== Array); // true
  </script>
</body>
```

每个 `iframe` 都有一个独立的运行环境，`document` 的全局对象不同于 `iframe` 的全局对象，类似的，全局对象上的 `Array` 肯定也不同。


## ShadowRealm API

`ShadowRealm API` 是一个新的 `JavaScript` 提案，它允许一个 JS 运行时创建多个高度隔离的 JS 运行环境（`realm`），每个 `realm` 具有独立的全局对象和内建对象。

ShadowRealm 具有下面的类型签名：

```js
declare class ShadowRealm {
  constructor();
  evaluate(sourceText: string): PrimitiveValueOrCallable;
  importValue(specifier: string, bindingName: string): Promise<PrimitiveValueOrCallable>;
}
```

每个 `ShadowRealm` 实例都有自己独立的运行环境，它提供了两种方法让我们来执行运行环境中的代码：

- `.evaluate()`：同步执行代码字符串，类似 `eval()`。
- `.importValue()`：返回一个 `Promise` 对象，异步执行代码字符串。

### shadowRealm.evaluate()


`.evaluate()` 的类型签名：

```js
evaluate(sourceText: string): PrimitiveValueOrCallable;
```

`.evaluate()` 的工作原理很像 `eval()`：

```js
const sr = new ShadowRealm();
console.assert(
  sr.evaluate(`'ab' + 'cd'`) === 'abcd'
);

```

但是与 `eval()` 不同的是，代码是在 `.evaluate()` 的独立运行环境中执行的:

```js
globalThis.realm = 'incubator realm';

const sr = new ShadowRealm();
sr.evaluate(`globalThis.realm = 'ConardLi realm'`);
console.assert(
  sr.evaluate(`globalThis.realm`) === 'ConardLi realm'
);
```

如果 `.evaluate()` 返回一个函数，为了方便在外部调用这个函数会被包装，然后在 `ShadowRealm` 中运行：

```js
globalThis.realm = 'incubator realm';

const sr = new ShadowRealm();
sr.evaluate(`globalThis.realm = 'ConardLi realm'`);

const wrappedFunc = sr.evaluate(`() => globalThis.realm`);
console.assert(wrappedFunc() === 'ConardLi realm');
```

每当一个值传入 `ShadowRealm` 时，它必须是原始类型或者可以被调用的。否则会抛出异常：

```js
> new ShadowRealm().evaluate('[]')
TypeError: value passing between realms must be callable or primitive
```

### shadowRealm.importValue() 

`.importValue()` 的类型签名：

```js
importValue(specifier: string, bindingName: string): Promise<PrimitiveValueOrCallable>;
```

你可以直接导入一个外部的模块，异步执行并返回一个 `Promise`，用法：

```js
// main.js
const sr = new ShadowRealm();
const wrappedSum = await sr.importValue('./my-module.js', 'sum');
console.assert(wrappedSum('hi', ' ', 'folks', '!') === 'hi ConardLi!');

// my-module.js
export function sum(...values) {
  return values.reduce((prev, value) => prev + value);
}
```

与 `.evaluate()` 一样，传入 `ShadowRealms` 的值（包括参数和跨环境函数调用的结果）必须是原始的或可调用的。


## ShadowRealms 可以用来做什么？

- 在 `Web IDE` 或 `Web` 绘图应用等程序中运行插件等第三方代码。

- 在 `ShadowRealms` 中创建一个编程环境，运行用户代码。

- 服务器可以在 `ShadowRealms` 中运行第三方代码。

- 在 ShadowRealms 中可以运行测试，这样外部的JS执行环境不会受到影响，并且每个套件都可以在新环境中启动（这有助于提高可复用性）。

- 网页抓取（从网页中提取数据）和网页应用测试等可以在 `ShadowRealms` 中运行。


## 与其他方案对比

### eval()和Function

`ShadowRealms` 与 `eval()` 和 `Function` 很像，但比它们俩都好一点：我们可以创建新的JS运行环境并在其中执行代码，这可以保护外部的JS运行环境不受代码执行的操作的影响。

### Web Workers 

`Web Worker` 是一个比 `ShadowRealms` 更强大的隔离机制。其中的代码运行在独立的进程中，通信是异步的。

但是，当我们想要做一些更轻量级的操作时，`ShadowRealms` 是一个很好的选择。它的算法可以同步计算，更便捷，而且全局数据管理更自由。

### iframe

前面我们已经提到了，每个 `iframe` 都有自己的运行环境，我们可以在里面同步执行代码。

```html
<body>
  <iframe>
  </iframe>
  <script>
    globalThis.realm = 'incubator';
    const iframeRealm = frames[0].window;
    iframeRealm.globalThis.realm = 'ConardLi';
    console.log(iframeRealm.eval('globalThis.realm')); // 'ConardLi'
  </script>
</body>
```

与 `ShadowRealms` 相比，还是有以下缺点：

- 只能在浏览器中使用 `iframe`；
- 需要向 `DOM` 添加一个 `iframe` 以对其进行初始化；
- 每个 `iframe` 环境都包含完整的 DOM，这在一些场景下限制了自定义的灵活度；
- 默认情况下，对象是可以跨环境的，这意味着需要额外的工作来确保代码安全。

### Node.js 上的 vm 模块

`Node.js` 的 `vm` 模块与 `ShadowRealm API` 类似，但具有更多功能：缓存 `JavaScript` 引擎、拦截 `import()` 等等。但它唯一的缺点就是不能跨平台，只能在 `Node.js` 环境下使用。

## 用法示例：在 ShadowRealms 中运行测试

下面我们来看个在 `ShadowRealms` 中运行测试的小 `Demo`，测试库收集通过 `test()` 指定的测试，并允许我们通过 `runTests()` 运行它们：

```js
// test-lib.js
const testDescs = [];

export function test(description, callback) {
  testDescs.push({description, callback});
}

export function runTests() {
  const testResults = [];
  for (const testDesc of testDescs) {
    try {
      testDesc.callback();
      testResults.push(`${testDesc.description}: OK\n`);
    } catch (err) {
      testResults.push(`${testDesc.description}: ${err}\n`);
    }
  }
  return testResults.join('');
}
```

使用库来指定测试：

```js
// my-test.js
import {test} from './test-lib.js';
import * as assert from './assertions.js';

test('succeeds', () => {
  assert.equal(3, 3);
});

test('fails', () => {
  assert.equal(1, 3);
});

export default true;
```

在下一个示例中，我们动态加载 `my-test.js` 模块来收集然后运行测试。

唉，目前还没有办法在不导入任何东西的情况下加载模块。

这就是为什么在前面示例的最后一行中有一个默认导出。我们使用 `ShadowRealm .importvalue()` 方法导入 `default export` 。

```js
// test-runner.js
async function runTestModule(moduleSpecifier) {
  const sr = new ShadowRealm();
  await sr.importValue(moduleSpecifier, 'default');
  const runTests = await sr.importValue('./test-lib.js', 'runTests');
  const result = runTests();
  console.log(result);
}
await runTestModule('./my-test.js');

```

## 在 ShadowRealms 中运行 Web 应用

`jsdom` 库创建了一个封装的浏览器环境，可以用来测试 `Web` 应用、从 `HTML` 中提取数据等。它目前使用的是 `Node.js vm` 模块，未来可能会更新为使用 `ShadowRealms`（后者的好处是可以跨平台，而 `vm` 目前只支持 `Node.js`）。


## 参考

- https://2ality.com/2022/04/shadow-realms.html
- https://dev.to/smpnjn/future-javascript-shadowrealms-20mg



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
