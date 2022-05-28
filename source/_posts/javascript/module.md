---
title: 手动实现一个 JavaScript 模块执行器
category: JavaScript
tag: 
- JavaScript
- 技术原理
date: 2020-10-16
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



如果给你下面这样一个代码片段（动态获取的代码字符串），让你在前端动态引入这个模块并执行里面的函数，你会如何处理呢？

```js
module.exports = { 
  name : 'ConardLi',
  action : function(){
    console.log(this.name);
  }
};
```

## node 环境的执行

如果在 `node` 环境，我们可能会很快的想到使用 `Module` 模块， `Module` 模块中有一个私有函数 `_compile`，可以动态的加载一个模块：

```js
export function getRuleFromString(code) {
  const myModule = new Module('my-module');
  myModule._compile(code,'my-module');
  return myModule.exports;
}
```

实现就是这么简单，后面我们会回顾一下 `_compile` 函数的原理，但是需求可不是这么简单，我们如果要在前端环境动态引入这段代码呢？

嗯，你没听错，最近正好碰到了这样的需求，需要在前端和 `Node` 端抹平动态引入模块的逻辑，好，下面我们来模仿 `Module` 模块实现一个前端环境的 `JavaScript` 模块执行器。

首先我们先来回顾一下 node 中的模块加载原理。

## node Module 模块加载原理


`Node.js` 遵循 `CommonJS` 规范，该规范的核心思想是允许模块通过 `require` 方法来同步加载所要依赖的其他模块，然后通过 `exports` 或 `module.exports` 来导出需要暴露的接口。其主要是为了解决 `JavaScript` 的作用域问题而定义的模块形式，可以使每个模块它自身的命名空间中执行。

再在每个 `NodeJs` 模块中，我们都能取到 `module、exports、__dirname、__filename` 和 `require` 这些模块。并且每个模块的执行作用域都是相互隔离的，互不影响。

其实上面整个模块系统的核心就是 `Module` 类的 `_compile` 方法，我们直接来看 `_compile` 的源码：

```js
Module.prototype._compile = function(content, filename) {
  // 去除 Shebang 代码
  content = internalModule.stripShebang(content);
​
  // 1.创建封装函数
  var wrapper = Module.wrap(content); 
​
  // 2.在当前上下文编译模块的封装函数代码
  var compiledWrapper = vm.runInThisContext(wrapper, { 
    filename: filename,
    lineOffset: 0,
    displayErrors: true
  });
​
  var dirname = path.dirname(filename);
  var require = internalModule.makeRequireFunction(this); 
  var depth = internalModule.requireDepth;
  
  // 3.运行模块的封装函数并传入 module、exports、__dirname、__filename、require 
  var result = compiledWrapper.call(this.exports, this.exports, require, this, filename, dirname);
  return result;
};
```

整个执行过程我将其分为三步：

### 创建封装函数

第一步即调用 `Module` 内部的 `wrapper` 函数对模块的原始内容进行封装，我们先来看看 `wrapper` 函数的实现：

```js
Module.wrap = function(script) {
  return Module.wrapper[0] + script + Module.wrapper[1];
};
​
Module.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
];
```

`CommonJS` 的主要目的就是解决 `JavaScript` 的作用域问题，可以使每个模块它自身的命名空间中执行。在没有模块化方案的时候，我们一般会创建一个自执行函数来避免变量污染：

```js
(function(global){
  // 执行代码。。
})(window)
```

所以这一步至关重要，首先 `wrapper` 函数就将模块本身的代码片段包裹在一个函数作用域内，并且将我们需要用到的对象作为参数引入。所以上面的代码块被包裹后就变成了：

```js
(function (exports, require, module, __filename, __dirname) {
  module.exports = { 
    name : 'ConardLi',
    action : function(){
     console.log(this.name);
   }
  };
});
```

### 编译封装函数代码

`NodeJs` 中的 `vm` 模块提供了一系列 `API` 用于在 `V8` 虚拟机环境中编译和运行代码。`JavaScript` 代码可以被编译并立即运行，或编译、保存然后再运行。

`vm.runInThisContext()` 在当前的 `global` 对象的上下文中编译并执行 `code`，最后返回结果。运行中的代码无法获取本地作用域，但可以获取当前的 `global` 对象。

```js
  var compiledWrapper = vm.runInThisContext(wrapper, { 
    filename: filename,
    lineOffset: 0,
    displayErrors: true
  });
```

所以以上代码执行后，就将代码片段字符串编译成了一个真正的可执行函数：

```js
(function (exports, require, module, __filename, __dirname) {
  module.exports = { 
    name : 'ConardLi',
    action : function(){
     console.log(this.name);
   }
  };
});
```

### 运行封装函数

最后通过 `call` 来执行编译得到的可执行函数，并传入对应的对象。

```js
var result = compiledWrapper.call(this.exports, this.exports, require, this, filename, dirname);
```

所以看到这里你应该会明白，我们在模块中拿到的 `module`，就是 `Module` 模块的实例本身，我们直接调用的 `exports` 实际上是 `module.exports` 的引用，所以我们既可以使用 `module.exports` 也可以使用 `exports` 来导出一个模块。

## 实现 Module 模块

如果我们想在前端环境执行一个 `CommonJS` 模块，那么我们只需要手动实现一个 `Module` 模块就好了，重新梳理上面的流程，如果只考虑模块代码块动态引入的逻辑，我们可以抽象出下面的代码：

```js
export default class Module {
  exports = {}
  wrapper = [
    'return (function (exports, module) { ',
    '\n});'
  ];
​
  wrap(script) {
    return `${this.wrapper[0]} ${script} ${this.wrapper[1]}`;
  };
​
  compile(content) {
    const wrapper = this.wrap(content);
    const compiledWrapper = vm.runInContext(wrapper);
    compiledWrapper.call(this.exports, this.exports, this);
  }
}
```

这里有个问题，在浏览器环境是没有 `VM` 这个模块的，`VM` 会将代码加载到一个上下文环境中，置入沙箱（`sandbox`），让代码的整个操作执行都在封闭的上下文环境中进行，我们需要自己实现一个浏览器环境的沙箱。

## 实现浏览器沙箱

### eval

在浏览器执行一段代码片段，我们首先想到的可能就是 `eval`， `eval` 函数可以将一个 `Javascript` 字符串视作代码片段执行。

但是，由 `eval()` 执行的代码能够访问闭包和全局作用域，这会导致被称为代码注入 `code injection` 的安全隐患， `eval` 虽然好用，但是经常被滥用，是 `JavaScript` 最臭名昭著的功能之一。

所以，后来又出现了很多在沙箱而非全局作用域中的执行字符串代码的值的替代方案。

### new Function()

`Function` 构造器是 `eval()` 的一个替代方案。`new Function(...args, 'funcBody')` 对传入的 `'funcBody'` 字符串进行求值，并返回执行这段代码的函数。

```js
fn = new Function(...args, 'functionBody');
```

返回的 `fn` 是一个定义好的函数，最后一个参数为函数体。它和 `eval` 有两点区别：

-   `fn` 是一段编译好的代码，可以直接执行，而 `eval` 需要编译一次
-   `fn` 没有对所在闭包的作用域访问权限，不过它依然能够访问全局作用域

但是这仍然不能解决访问全局作用域的问题。

### with 关键词

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b7f849864f543dfbb08e2746b5d32a2~tplv-k3u1fbpfcp-zoom-1.image)

`with` 是 `JavaScript` 一个冷门的关键字。它允许一个半沙箱的运行环境。`with` 代码块中的代码会首先试图从传入的沙箱对象获得变量，但是如果没找到，则会在闭包和全局作用域中寻找。闭包作用域的访问可以用`new Function()` 来避免，所以我们只需要处理全局作用域。`with` 内部使用 `in` 运算符。在块中访问每个变量，都会使用 `variable in sandbox` 条件进行判断。若条件为真，则从沙箱对象中读取变量。否则，它会在全局作用域中寻找变量。

```
function compileCode(src) {
  src = 'with (sandbox) {' + src + '}'
  return new Function('sandbox', src)
}
```

试想，如果 `variable in sandbox` 条件永远为真，沙箱环境不就永远也读取不到环境变量了吗？所以我们需要劫持沙箱对象的属性，让所有的属性永远都能读取到。

### Proxy

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/71d4d3667ace49f58e1a1b1f2342fbfa~tplv-k3u1fbpfcp-zoom-1.image)

`ES6` 中提供了一个 `Proxy` 函数，它是访问对象前的一个拦截器，我们可以利用 `Proxy` 来拦截 `sandbox` 的属性，让所有的属性都可以读取到：

```js
function compileCode(code) {
  code = 'with (sandbox) {' + code + '}';
  const fn = new Function('sandbox', code);
  return (sandbox) => {
    const proxy = new Proxy(sandbox, {
      has() {
        return true; 
      }
    });
    return fn(proxy);
  }
}
```

### Symbol.unscopables

`Symbol.unscopables` 是一个著名的标记。一个著名的标记即是一个内置的 `JavaScript Symbol`，它可以用来代表内部语言行为。

`Symbol.unscopables` 定义了一个对象的 `unscopable`（不可限定）属性。在 `with` 语句中，不能从 `Sandbox` 对象中检索 `Unscopable` 属性，而是直接从闭包或全局作用域检索属性。

所以我们需要对 `Symbol.unscopables` 这种情况做一次加固，

```js
function compileCode(code) {
  code = 'with (sandbox) {' + code + '}';
  const fn = new Function('sandbox', code);
  return (sandbox) => {
    const proxy = new Proxy(sandbox, {
      has() {
        return true; 
      },
      get(target, key, receiver) {
        if (key === Symbol.unscopables) {
          return undefined; 
        }
        Reflect.get(target, key, receiver);
      }
    });
    return fn(proxy);
  }
}
```

### 全局变量白名单

但是，这时沙箱里是执行不了浏览器默认为我们提供的各种工具类和函数的，它只能作为一个没有任何副作用的纯函数，当我们想要使用某些全局变量或类时，可以自定义一个白名单：

```js
const ALLOW_LIST = ['console'];
​
function compileCode(code) {
  code = 'with (sandbox) {' + code + '}';
  const fn = new Function('sandbox', code);
  return (sandbox) => {
    const proxy = new Proxy(sandbox, {
      has() {
        if (!ALLOW_LIST.includes(key)) {
            return true;
        }
      },
      get(target, key, receiver) {
        if (key === Symbol.unscopables) {
          return undefined; 
        }
        Reflect.get(target, key, receiver);
      }
    });
    return fn(proxy);
  }
}
```

## 最终代码：

好了，总结上面的代码，我们就完成了一个简易的 `JavaScript` 模块执行器：

```js
const ALLOW_LIST = ['console'];
​
export default class Module {
​
  exports = {}
  wrapper = [
    'return (function (exports, module) { ',
    '\n});'
  ];
​
  wrap(script) {
    return `${this.wrapper[0]} ${script} ${this.wrapper[1]}`;
  };
​
  runInContext(code) {
    code = `with (sandbox) { ${code}  }`;
    const fn = new Function('sandbox', code);
    return (sandbox) => {
      const proxy = new Proxy(sandbox, {
        has(target, key) {
          if (!ALLOW_LIST.includes(key)) {
            return true;
          }
        },
        get(target, key, receiver) {
          if (key === Symbol.unscopables) {
            return undefined;
          }
          Reflect.get(target, key, receiver);
        }
      });
      return fn(proxy);
    }
  }
​
  compile(content) {
    const wrapper = this.wrap(content);
    const compiledWrapper = this.runInContext(wrapper)({});
    compiledWrapper.call(this.exports, this.exports, this);
  }
}
```

测试执行效果：

```js
function getModuleFromString(code) {
  const scanModule = new Module();
  scanModule.compile(code);
  return scanModule.exports;
}
​
const module = getModuleFromString(`
module.exports = { 
  name : 'ConardLi',
  action : function(){
    console.log(this.name);
  }
};
`);
​
module.action(); // ConardLi
```

如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
