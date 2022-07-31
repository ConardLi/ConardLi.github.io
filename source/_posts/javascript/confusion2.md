---
title: 常见的 JS 代码混淆技术
category: JavaScript
date: 2022-07-24
tags:
  - JavaScript
  - Web安全
  - 代码混淆
---



大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


我们在上周的文章中一种奇特的 JavaScript 编码风格：[Get 一种可以用来装逼的 JavaScript 编码风格](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247495173&idx=1&sn=0ec3b6ce4f0a3e670c4d484bd636de15&chksm=c2e11b2ef5969238d5847c0f36aaadd1d5b523178ad047f8fc834a33063810477eb09c7b1a9f&token=1369150953&lang=zh_CN#rd)，引起了广大网友的热议。

这是实际上属于一种代码混淆技术，可以让们的代码更难阅读和逆向，同时也能租网一些恶意爬虫和自动化分析。
天我就带大家来看看还有哪些其他能让 `JavaScript` 代码变得难以分析的代码混淆技术。

我们以下面这段代码为例：

```js
console.log("ConardLi",666);
```

通过一些转换，它可以变成下面这个样子：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a49d419122224ebda295cf3c4e44fa1a~tplv-k3u1fbpfcp-zoom-1.image)


怎么做到的呢？我们一起来看一下～

## 十六进制字符串编码

我们尝试去 `Javascript Obfuscator` 这个网站，选中 `Encode Strings` 复选框，将得到下面的代码：


```js
console["\x6C\x6F\x67"]("\x43\x6F\x6E\x61\x72\x64\x4C\x69\x20"+ 666)
```

它的原理很简单，就是将字符串的每个 `ASCII` 字符转换为十六进制形式（将函数调用改为用括号的形式，例如 `console.log` -> `console['log']` 在代码混淆中也是相当常见的做法），这就是最简单的混淆了，但是只能骗骗小白，我们可以轻易的反解：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5eee488d4bfe4f9ebff055914b4a95c6~tplv-k3u1fbpfcp-zoom-1.image)

这种技术还有一些其他变体，比如用 `unicode` 编码替换字符。


> https://javascriptobfuscator.com/Javascript-Obfuscator.aspx

## 字符串数组映射


还是在上面的网站，我们选中 `Move Strings` 这个选项，得到的代码是下面这样的：

```js
var _0x8925=["\x43\x6F\x6E\x61\x72\x64\x4C\x69\x20","\x6C\x6F\x67"];
console[_0x8925[1]](_0x8925[0]+ 666)
```

多了个字符串数组，通过在不同索引处引入数组来间接使用这些字符串。


## 死代码注入

死代码其实指的就是一些无法访问的代码，我们可以在原本的代码上额外注入一些永远无法访问的代码来让代码难以阅读，但是同时也会让代码变得更大。这次我们尝试一下 `defendjs`：

安装：

```shell
$ npm install -g https://github.com/alexhorn/defendjs.git
```

我们尝试创建一个 `conardli.js` 并且将上面的代码放入这个文件，执行下面的命令：

```shell
$ defendjs --input conardli.js --features dead_code --output .
```

得到了下面这一大坨代码：

```js
(function () {
    function a(a, d) {
        var b = new Array(0);;
        var c = arguments;
        while (true)
            try {
                switch (a) {
                case 21309:
                    return;
                case 792:
                    function e(a, b) {
                        return Array.prototype.slice.call(a).concat(Array.prototype.slice.call(b));
                    }
                    function f() {
                        var a = arguments[0], c = Array.prototype.slice.call(arguments, 1);
                        var b = function () {
                            return a.apply(this, c.concat(Array.prototype.slice.call(arguments)));
                        };
                        b.prototype = a.prototype;
                        return b;
                    }
                    function g(a, b) {
                        return Array.prototype.slice.call(a, b);
                    }
                    function h(b) {
                        var c = {};
                        for (var a = 0; a < b.length; a += 2) {
                            c[b[a]] = b[a + 1];
                        }
                        return c;
                    }
                    function i(a) {
                        return a.map(function (a) {
                            return String.fromCharCode(a & ~0 >>> 16) + String.fromCharCode(a >> 16);
                        }).join('');
                    }
                    function j() {
                        return String.fromCharCode.apply(null, arguments);
                    }
                    console.log('ConardLi', 666);
                    a = 21309;
                    break;
                }
            } catch (b) {
                $$defendjs$tobethrown = null;
                switch (a) {
                default:
                    throw b;
                }
            }
    }
    a(792, {});
}())
```

代码很大，其实仔细分析就会发现其余插入的代码都是无法运行的：



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/79b7b58615fc4913a3d09e1c68da3a1c~tplv-k3u1fbpfcp-zoom-1.image)

最顶层包了一个 `IIFE`，然后有一个 `a` 函数，`a、b` 两个参数。调用 `a` 函数时只传入了第一个参数 792，然后就会发现 a 函数里有个 `switch` 语句，只会执行到第二个 `case`，里面是这样的语句：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba1e9fc0c05540c3bffbb173797315c3~tplv-k3u1fbpfcp-zoom-1.image)

e、f、g、h、j、i 这几个函数都是没有调用的，所以只会执行最后的 `console.log('ConardLi', 666);` 语句...

> https://github.com/alexhorn/defendjs

## 作用域混淆

我们将代码还原回去，重新执行 `defendjs` 的 `scope` 能力：

```shell
$ defendjs --input conardli.js --features scope --output .
```

```js
(function () {
    {
        {
            function b(a, b) {
                return Array.prototype.slice.call(a).concat(Array.prototype.slice.call(b));
            }
            function c() {
                var a = arguments[0], c = Array.prototype.slice.call(arguments, 1);
                var b = function () {
                    return a.apply(this, c.concat(Array.prototype.slice.call(arguments)));
                };
                b.prototype = a.prototype;
                return b;
            }
            function d(a, b) {
                return Array.prototype.slice.call(a, b);
            }
            function e(b) {
                var c = {};
                for (var a = 0; a < b.length; a += 2) {
                    c[b[a]] = b[a + 1];
                }
                return c;
            }
            function f(a) {
                return a.map(function (a) {
                    return String.fromCharCode(a & ~0 >>> 16) + String.fromCharCode(a >> 16);
                }).join('');
            }
            function g() {
                return String.fromCharCode.apply(null, arguments);
            }
        }
        var a = [];
        console.log('ConardLi', 666);
    }
}())
```

这个可能看起来像是前面的一个简单版本，但是有一个关键的区别：它引入了多个具有重复标识符的词法作用域。例如，`a` 可能是最内层作用域中第一个函数的参数，也可以是第二个函数中的变量，甚至可以是与我们的 `conaole.log` 语句相同作用域中的变量。在这个简单的示例中，很容易看穿，因为最内层范围内的任何函数都不会在任何地方被调用，但是，现实的业务代码往往是很复杂的，混淆后就不那么容易看穿了。


## 字符编码

还是使用 `defendjs` ，对我们的代码执行下面的命令：

```
$ defendjs --input conardli.js --features literals --output .
```

得到下面的代码：

```js
(function () {
    function c() {
        var c = arguments;
        var b = [];
        b[1] = '';
        b[1] += a(67, 111, 110);
        b[1] += a(97);
        b[1] += a(114, 100);
        b[1] += a(76, 105);
        return b[1];
    }
    {
        {
            function e(a, b) {
                return Array.prototype.slice.call(a).concat(Array.prototype.slice.call(b));
            }
            function d() {
                var a = arguments[0], c = Array.prototype.slice.call(arguments, 1);
                var b = function () {
                    return a.apply(this, c.concat(Array.prototype.slice.call(arguments)));
                };
                b.prototype = a.prototype;
                return b;
            }
            function f(a, b) {
                return Array.prototype.slice.call(a, b);
            }
            function g(b) {
                var c = {};
                for (var a = 0; a < b.length; a += 2) {
                    c[b[a]] = b[a + 1];
                }
                return c;
            }
            function h(a) {
                return a.map(function (a) {
                    return String.fromCharCode(a & ~0 >>> 16) + String.fromCharCode(a >> 16);
                }).join('');
            }
            function a() {
                return String.fromCharCode.apply(null, arguments);
            }
        }
        var b = [];
        console.log(d(c, b)(), 666);
    }
}())
```

在这种情况下，硬编码会被转换成 `Unicode` 然后重新计算，这样直接阅读代码就很难再直接看穿硬编码的字符串了。


## 变量缩短


`Mangling` 是一种为了优化和混淆目的而缩短变量和属性名称的转换。比如下面的代码：

```js
let sixSixSix = 666;
let name = "ConardLi ";
console.log(name + sixSixSix);
```

我们使用 `DefendJS` 的 `mangling` 功能：

```shell
$ defendjs --input conardli.js --features mangle --output .
```

得到的代码是：

```js
(function () {
    var a = 666;
    var b = 'ConardLi! ';
    console.log(b + a);
}())
```

两个变量都被重新命名了，在这个简单的例子下还是很好分析的。但是如果是庞大的业务代码，这会让我们的代码变得非常难以阅读。


## 代码压缩

下面，综合利用一下几种技术，执行：

```
defendjs --input conardli.js --output . --features=control_flow,literals,mangle,compress
```

得到下面的代码：

```js
(function(){function a(d,g){var b=new Array(1);;var e=arguments;while(true)try{switch(d){case 23773:b[1]='';b[1]+=c(67,111);b[1]+=c(110);b[1]+=c(97,114);b[1]+=c(100,76);b[1]+=c(105);return b[1];case 14399:return;case 16527:function h(a,b){return Array.prototype.slice.call(a).concat(Array.prototype.slice.call(b));}function f(){var a=arguments[0],c=Array.prototype.slice.call(arguments,1);var b=function(){return a.apply(this,c.concat(Array.prototype.slice.call(arguments)));};b.prototype=a.prototype;return b;}function i(a,b){return Array.prototype.slice.call(a,b);}function j(b){var c={};for(var a=0;a<b.length;a+=2){c[b[a]]=b[a+1];}return c;}function k(a){return a.map(function(a){return String.fromCharCode(a&~0>>>16)+String.fromCharCode(a>>16);}).join('');}function c(){return String.fromCharCode.apply(null,arguments);}console.log(f(a,23773,b)(),666);d=14399;break;}}catch(a){$$defendjs$tobethrown=null;switch(d){default:throw a;}}}a(16527,{});}())
```


## 最后

参考链接：

- https://github.com/alexhorn/defendjs
- https://javascriptobfuscator.com/Javascript-Obfuscator.aspx
- https://www.trickster.dev/post/
- javascript-obfuscation-techniques-by-example/



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。