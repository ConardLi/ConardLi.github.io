---
title: 聊一下 Chrome 新增的可信类型
category: Web
tag: 
- Web安全
- 浏览器策略
date: 2020-04-22	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。




`Chrome` 即将在 `83` 版本新增一个可信类型（`Trusted types`），其号称这一特性可以全面消除 `DOM XSS`，为此我连夜分析了一波，下面我就带大家来具体看一下这个特性：

## DOM XSS

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/94d8b88b0cad4912a96750a6965edef8~tplv-k3u1fbpfcp-zoom-1.image)

多年来，`DOM XSS` 一直是最普遍且最危险的 `Web` 安全漏洞之一。根据去年发布的 `Imperva` 报告，`XSS` 漏洞是 `2014` 年、`2015` 年、`2016` 年和 `2017` 年最普遍的基于 `Web` 的攻击形式。`2018` 年的漏洞冠军被 `SQL` 注入拿到了，`XSS` 漏洞仍然排在第二位。

平时大家也经常忽略 `XSS` 漏洞，因为它们并不总是对访问站点的用户造成直接损害。然而，它们往往是复杂的漏洞利用程序中的第一个踏脚石，可以促进更具破坏性的攻击。在许多情况下，消除 XSS 攻击可以使用户免受更复杂的攻击。

`XSS` 有两种不同的类型，某些 `XSS` 漏洞是由服务器端代码导致的，这些代码不安全地创建了构成网站的 `HTML` 代码。其他问题则在客户端上导致的，比如开发者接收用户可以控制的内容来调用一些危险的 `JavaScript` 函数。

为了防止服务器端 `XSS` ，不要通过连接字符串来生成 `HTML` ，而是使用安全的上下文自动转义模板库。当你避免不了使用这种方式时，可以使用 `nonce-based` 的安全策略来对其进行额外的防御。

现在，浏览器可以使用 `Trusted Types` 来防御客户端 `XSS`。

## API 简介

`Trusted Types` 的工作方式就是锁定以下危险函数的接收参数，如果是不安全的，就直接阻止。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af56850017064e62af798e0bc7e2b590~tplv-k3u1fbpfcp-zoom-1.image)

您可能已经有所耳闻，因为出于安全原因，浏览器和 `Web` 框架已经开始建议你远离下面这些功能。

-   脚本操作：
-   `<script src>` 和设置 `<script>` 元素的文本内容。
-   从字符串生成 `HTML`：
-   -   `innerHTML，outerHTML，insertAdjacentHTML， <iframe> srcdoc， document.write，document.writeln，和DOMParser.parseFromString`
    -   执行插件内容：
    -   -   `<embed src>，<object data>和<object codebase>`
        -   运行 `JavaScript` 代码的编译：
        -   `eval，setTimeout，setInterval，new Function()`

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d6dae5247bc454f934861187c29c058~tplv-k3u1fbpfcp-zoom-1.image)

          
`Trusted Types` 为开发者提供了一个内容安全策略，你可以在你的 `CSP` 配置中增加下面的配置：

```
Content-Security-Policy: trusted-types;
```

当你开启这个配置之后，如果你页面中执行了下面这样的代码，浏览器将引发 `TypeError` 并阻止将 `DOM XSS` 接收器与字符串一起使用 ：

```
document.innerHTML  = '<img src=code秘密花园.jpg>';
```

如果你用下面这种安全的方式创建了 `DOM`，浏览器则不会抛出错误：

```
el.textContent = '';
const img = document.createElement('img');
img.src = 'code秘密花园.jpg';
el.appendChild(img);
```

或者，这个危险的 `innerHTML` 方法可以接受一个受信任的类型字符串，浏览器也不会报错，下面我们来看看如何使用 `Trusted Types` 创建受信任的字符串：

## 创建受信任的字符串

### 使用库

一些库已经生成了可传递给接收器函数的可信类型。例如，您可以使用 `DOMPurify` 过滤 `HTML` 代码段：

```
import DOMPurify from 'dompurify';
el.innerHTML = DOMPurify.sanitize(html, {RETURN_TRUSTED_TYPE: true);
```

`DOMPurify` 支持可信类型，并将返回包装在 `TrustedHTML` 对象中的经过过滤的 `HTML` ，以使浏览器不会产生冲突。

### 使用 Trusted Type 策略

如果你的浏览器支持了 `trustedTypes` ，你可以使用 `trustedTypes` 创建一个合适的过滤策略，这个策略就是创建信任字符串的工厂，你可以在这个策略上实现你自己的安全规则：

```
if (window.trustedTypes && trustedTypes.createPolicy) { 
  const escapeHTMLPolicy = trustedTypes.createPolicy('conardEscapePolicy', {
    createHTML: string => string.replace(/\</g, '&lt;')
  });
}
```

这段代码创建了一个称为 `conardEscapePolicy` 的策略 ，可以通过 `createHTML()` 函数创建受信任的字符串。定义的规则将使用 `HTML` 转义 `<` 字符，以防止创建新的 `HTML` 元素。

```
const escaped = escapeHTMLPolicy.createHTML('<img src=x onerror=alert(1)>');
console.log(escaped instanceof TrustedHTML);  // true
el.innerHTML = escaped;  // '&lt;img src=x onerror=alert(1)>'
```

同样的，你可以在你的 `CSP` 配置中指定你实现的信任策略，未被指定的策略同样会被浏览器阻止：

```
Content-Security-Policy: trusted-types <policyName>;
Content-Security-Policy: trusted-types <policyName> <policyName> 'allow-duplicates'; 
```

有时你无法更改有问题的代码。例如，从 `CDN` 加载第三方库，在这种情况下可以使用默认策略：

```
if (window.trustedTypes && trustedTypes.createPolicy) {
  trustedTypes.createPolicy('default', {
    createHTML: (string, sink) => DOMPurify.sanitize(string, {RETURN_TRUSTED_TYPE: true});
  });
}
```

> 谨慎使用这个默认策略，因为它并不一定适用于你的过滤场景，尽量实现自己的安全规则。

## 兼容性

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae9a01af09bd407cb481db58cbd7f13c~tplv-k3u1fbpfcp-zoom-1.image)

不过大家先别着急用，这个特性最早将于不久后的 `Chrome 83` 版本和大家见面，因此目前大部分浏览器还尚未支持。不过，具有较大的 `XSS` 风险的站点建议大家都支持一波～

## CSP 上报

不过这个 `CSP` 配置一定要谨慎的开启，你的第一次更改不一定是全面的，如果你直接开启了可能会导致大量代码被浏览器阻止，所以建议还是先开启 `Report-Only`，这样被浏览器阻止的代码就会先被上报上来，你可以根据上报的日志不断完善你代码中的安全规则：

```
Content-Security-Policy-Report-Only: require-trusted-types-for 'script'; report-uri //csp.reporter.example
```

比如，你可能会看到下面格式的上报结果：

```
{
"csp-report": {
    "document-uri": "https://csp.reporter.example",
    "violated-directive": "require-trusted-types-for",
    "disposition": "report",
    "blocked-uri": "trusted-types-sink",
    "line-number": 39,
    "column-number": 12,
    "source-file": "https://csp.reporter.example/script.js",
    "status-code": 0,
    "script-sample": "Element innerHTML <img src=x"
  }
}
```

这表示在 `https://csp.reporter.example/script.js` 第 `39` 行 `innerHTML` 中以 `<img src=x` 开头的字符串被阻止调用 。


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
