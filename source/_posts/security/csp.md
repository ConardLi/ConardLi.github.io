---
title: 为什么你的网页需要 CSP?
category: Web安全
tag: 
- Web安全
- 浏览器策略
date: 2020-04-26
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

内容安全策略（`CSP`）是一个 `HTTP Header`，`CSP` 通过告诉浏览器一系列规则，严格规定页面中哪些资源允许有哪些来源， 不在指定范围内的统统拒绝。

使用它是防止跨站点脚本（XSS）漏洞的最佳方法。由于难以使用 `CSP` 对现有网站进行改造（可通过渐进式的方法），因此 `CSP` 对于所有新网站都是强制性的，强烈建议对所有现有高风险站点进行 `CSP` 策略配置。

## 为什么要配置

`CSP` 的主要好处就是可以全面禁止使用不安全的嵌入式 `JavaScript`。内联 `JavaScript`（无论是反射的还是存储的），意味着不正确的转义用户输入都可以被 `Web` 浏览器解释为 `JavaScript` 代码。通过使用 `CSP` 禁用嵌入式 `JavaScript`，你可以有效消除针对你站点的几乎所有 `XSS` 攻击。

注意，禁用内联 `JavaScript` 意味着必须从 `src` 标记加载所有 `JavaScript <script>`。直接在标记上使用的事件处理程序（例如 `onclick` ）将无法正常工作，`<script>`标记内的 `JavaScript` 也会通过。此外，使用 `<style>` 标签或 `style` 属性的内联样式表也将无法加载。因此为了让 `CSP` 易于实现，在设计站点时必须非常小心。

## 如何配置？

开启 `CSP` 很简单, 你只需要配置你的网络服务器返回 `Content-Security-Policy` 这个 `HTTP Header` (有时你会看到一些关于`X-Content-Security-Policy Header` 的提法, 那是旧版本，你无须再如此指定它)。

除此之外，`<meta>` 元素也可以被用来配置该策略, 例如

```
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src https://*; child-src 'none';">
```

## 指令

无论是 `header` ，还是在 `<meta>` 标签中指定，其值的格式都是统一的，由一系列 `CSP` 指令（`directive`）组合而成。

```
Content-Security-Policy: <policy-directive>; <policy-directive>
```

这里 `directive`，即指令，是 `CSP` 规范中规定用以详细详述某种资源的来源，比如前面示例中使用的 `script-src`，指定脚本可以有哪些合法来源，`img-src` 则指定图片的合法涞源，以下是常用指令：

-   base-uri 限制可出现在页面 `<base>` 标签中的链接。
-   child-src 列出可用于 worker 及以 frame 形式嵌入的链接。譬如: child-src <https://youtube.com> 表示只能从 Youtube 嵌入视频资源。
-   connect-src 可发起连接的地址 (通过 XHR, WebSockets 或 EventSource)。
-   font-src 字体来源。譬如，要使用 Google web fonts 则需要添加 font-src <https://themes.googleusercontent.com> 规则。
-   form-action `<form>`标签可提交的地址。
-   frame-ancestors 当前页面可被哪些来源所嵌入（与 child-src 正好相反）。作用于 `<frame>`, `<iframe>`, `<embed>`及 `<applet>`。该指令不能通过 `<meta>`指定且只对非 HTML文档类型的资源生效。
-   frame-src 该指令已在 level 2 中废弃但会在 level 3 中恢复使用。未指定的情况下回退到 tochild-src 指令。
-   img-src 指定图片来源。
-   media-src 限制音视频资源的来源。
-   object-src Flash 及其他插件的来源。
-   plugin-types 限制页面中可加载的插件类型。
-   report-uri 指定一个可接收 CSP 报告的地址，浏览器会在相应指令不通过时发送报告。不能通过 `<meta>` 标签来指定。
-   style-src 限制样式文件的来源。
-   upgrade-insecure-requests 指导客户端将页面地址重写，HTTP 转 HTTPS。用于站点中有大量旧地址需要重定向的情形。
-   worker-src CSP Level 3 中的指令，规定可用于 worker, shared worker, 或 service worker 中的地址。

## 预设值

除了配置指定的涞源以外，这些指令还可以配置一些预定义的值来完成一些默认配置：

-   `none` 不匹配任何东西。
-   `self` 匹配当前域，但不包括子域。比如 example.com 可以，api.example.com 则会匹配失败。
-   `unsafe-inline` 允许内嵌的脚本及样式。是的，没看错，对于页面中内嵌的内容也是有相应限制规则的。
-   `unsafe-eval` 允许通过字符串动态创建的脚本执行，比如 eval，setTimeout 等。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/451ba4792d494d21bea08e6fe5c3fe1a~tplv-k3u1fbpfcp-zoom-1.image)

如果页面中非得用内联的写法，还有种方式。即页面中这些内联的脚本或样式标签，赋值一个加密串，这个加密串由服务器生成，同时这个加密串被添加到页面的响应头里面。

```
<script nonce="EDNnf03nceIOfn39fn3e9h3sdfa">
​
  // 这里放置内联在 HTML 中的代码
​
</script> 
```

页面 HTTP 响应头的 `Content-Security-Policy`配置中包含相同的加密串：

```
Content-Security-Policy: script-src 'nonce-EDNnf03nceIOfn39fn3e9h3sdfa'
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d630b95bcef4cf28b5c488f55f7099b~tplv-k3u1fbpfcp-zoom-1.image)

## 配置示例

### 示例 1

所有内容均来自站点的同一个源 (不包括其子域名)

```
Content-Security-Policy: default-src 'self'
```

### 示例 2

允许内容来自信任的域名及其子域名 (域名不必须与CSP设置所在的域名相同)

```
Content-Security-Policy: default-src 'self' *.trusted.com
```

### 示例 3

允许网页应用的用户在他们自己的内容中包含来自任何源的图片, 但是限制音频或视频需从信任的资源提供者(获得)，所有脚本必须从特定主机服务器获取可信的代码.

```
Content-Security-Policy: default-src 'self'; img-src *; media-src media1.com media2.com; script-src userscripts.example.com
```

在这里，各种内容默认仅允许从文档所在的源获取, 但存在如下例外:

-   图片可以从任何地方加载(注意 "*" 通配符)。
-   多媒体文件仅允许从 media1.com 和 media2.com 加载(不允许从这些站点的子域名)。
-   可运行脚本仅允许来自于userscripts.example.com。

### 示例 4

一个线上银行网站的管理者想要确保网站的所有内容都要通过SSL方式获取，以避免攻击者窃听用户发出的请求。

```
Content-Security-Policy: default-src https://onlinebanking.jumbobank.com
```

该服务器仅允许通过HTTPS方式并仅从onlinebanking.jumbobank.com域名来访问文档。

### 示例 5

一个在线邮箱的管理者想要允许在邮件里包含HTML，同样图片允许从任何地方加载，但不允许JavaScript或者其他潜在的危险内容(从任意位置加载)。

```
Content-Security-Policy: default-src 'self' *.mailsite.com; img-src *
```

注意这个示例并未指定script-src。在此CSP示例中，站点通过 default-src 指令的对其进行配置，这也同样意味着脚本文件仅允许从原始服务器获取。

## 上报你的数据

当检测到非法资源时，除了控制台看到的报错信息，也可以让浏览器将日志发送到服务器以供后续分析使用。接收报告的地址可在 `Content-Security-Policy` 响应头中通过 `report-uri`指令来配置。当然，服务端需要编写相应的服务来接收该数据。

配置 `report-uri`

```
Content-Security-Policy: default-src 'self'; ...; report-uri /my_amazing_csp_report_parser;`
```

服务端收到请求：

```
{
  "csp-report": {
    "document-uri": "http://example.org/page.html",
    "referrer": "http://evil.example.com/",
    "blocked-uri": "http://evil.example.com/evil.js",
    "violated-directive": "script-src 'self' https://apis.google.com",
    "original-policy": "script-src 'self' https://apis.google.com; report-uri http://example.org/my_amazing_csp_report_parser"
  }
}
```

## Report Only

`CSP` 提供了一种报告模式，该模式下资源不会真的被限制加载，只会对检测到的问题进行上报 ，以 `JSON` 数据的形式发送到 `report-uri` 指定的地方。

通过指定 `Content-Security-Policy-Report-Only` 而不是 `Content-Security-Policy`，则开启了报告模式。

```
Content-Security-Policy-Report-Only: default-src 'self'; ...; report-uri /my_amazing_csp_report_parser;
```

当然，你也可以同时指定两种响应头，各自里的规则还会正常执行，不会互相影响。比如：

```
Content-Security-Policy: img-src *;

Content-Security-Policy-Report-Only: img-src ‘none’; report-uri http://reportcollector.example.com/collector.cgi
```

这里图片还是会正常加载，但是 `img-src ‘none’` 也会检测到并且发送报告。

报告模式对于测试非常有用。在开启 `CSP` 之前肯定需要对整站做全面的测试，将发现的问题及时修复后再真正开启，比如上面提到的对内联代码的改造。

## 如何检验配置成功了？

**在Network中可以看到配置成功的header：**

下面是 `Twitter` 的一个配置示例，非常完善：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2b8dae0b4c084ffab8362241d0e9d952~tplv-k3u1fbpfcp-zoom-1.image)

**在控制台可以看到资源 block 报错：**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2b3015bfa494cfaa95cf83c5ec88cd2~tplv-k3u1fbpfcp-zoom-1.image)

**Network中可以看到Block资源上报：**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b24d300f1e2149f4ad26e59fcd77eff5~tplv-k3u1fbpfcp-zoom-1.image)



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
