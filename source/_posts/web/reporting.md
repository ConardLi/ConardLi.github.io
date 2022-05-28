---
title: 使用浏览器的 Reporting API 上报站点错误
category: Web
tag: 
- Web
- 浏览器策略
date: 2020-11-17	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


`Reporting API` 定义了一个新的 `HTTP Header`，`Report-To`，它让 `Web` 开发人员以自定义的方式来将浏览器的警告和错误发送到指定服务器。例如 CSP违规， `Feature Policy` 违规，使用了废弃API，浏览器崩溃和网络错误等是可以使用 `Reporting API` 收集的一些信息。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6fc4899c9dfd4ace85d5f01b876d1165~tplv-k3u1fbpfcp-zoom-1.image)

## 简介

有些错误你可能在开发的时候永远都看不到，但是生产环境中可能出现，因为不同的用户、不同的使用环境、不同的浏览器都有可能出现意想不到的问题。

例如，假设你的新站点依赖 `document.write()` 来加载关键脚本。来自世界各地的新用户要访问你的站点，但是他们使用的连接可能比你的测试环境要慢得多。你所不知道的是，你的网站开始为他们中断，因为 `Chrome` 浏览器干涉阻止2G网络上的 `document.write()` 。如果没有 `Reporting API` ，就无法知道你宝贵的用户是否发生了这种情况。

`Reporting API` 可帮助捕获整个站点中潜在的错误。进行设置可让你对你的网站更放心，当真实用户访问你的网站时，没有发生任何可怕的事情。如果当他们确实遇到无法预料的错误时，你会知道的。

## Report-To Header

`Reporting API` 定义了一个新的 `HTTP Header` ，它的值是一个对象，它描述了浏览器要向以下对象报告错误的信息:

```json
Report-To: {
             "max_age": 10886400,
             "endpoints": [{
               "url": "https://analytics.provider.com/browser-errors"
             }]
           }
```

> 注意：如果你的 endpoints URL 与你的站点位于不同的来源，则 endpoints 应支持CORS 请求。（例如Access-Control-Allow-Origin: *; Access-Control-Allow-Methods: GET,PUT,POST,DELETE,OPTIONS; Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, X-Requested-With

## 配置多个端点

单个响应可以通过发送多个 `Report-To` 标头来一次配置多个端点：

```json
Report-To: {
             "group": "default",
             "max_age": 10886400,
             "endpoints": [{
               "url": "https://example.com/browser-reports"
             }]
           }
Report-To: {
             "group": "csp-endpoint",
             "max_age": 10886400,
             "endpoints": [{
               "url": "https://example.com/csp-reports"
             }]
           }
```

或将它们组合成一个HTTP标头：

```json
Report-To: {
             "group": "csp-endpoint",
             "max_age": 10886400,
             "endpoints": [{
               "url": "https://example.com/csp-reports"
             }]
           },
           {
             "group": "network-endpoint",
             "max_age": 10886400,
             "endpoints": [{
               "url": "https://example.com/network-errors"
             }]
           },
           {
             "max_age": 10886400,
             "endpoints": [{
               "url": "https://example.com/browser-errors"
             }]
           }
```

发送 `Report-To` 标头后，浏览器将根据端点的 `max_age` 值缓存端点，并将所有这些讨厌的控制台警告/错误发送到你的URL。

## 字段说明

-   group：（选填）上报端点名称，如果 `group` 未指定名称，则为上报端点指定名称 `default`。
-   max_age：（必填）一个非负整数，以秒为单位定义上报端点的生存期。
-   endpoints：（必填）JSON对象数组，用于指定报告收集器的实际URL。
-   include_subdomains：（选填）指定在报告错误时是否考虑子域。

## 浏览器如何发送报告

浏览器会定期批处理报告，并将其发送到你配置的报告URL。为了发送报告，浏览器发出一个POST 请求， `Content-Type: application/reports+json` 并带有一个正文，其中包含捕获的警告/错误数组。

下面是一个CSP报告的示例：

```json
POST /csp-reports HTTP/1.1
Host: example.com
Content-Type: application/reports+json
​
[{
  "type": "csp",
  "age": 10,
  "url": "https://example.com/vulnerable-page/",
  "user_agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0",
  "body": {
    "blocked": "https://evil.com/evil.js",
    "directive": "script-src",
    "policy": "script-src 'self'; object-src 'none'",
    "status": 200,
    "referrer": "https://evil.com/"
  }
}, }
  ...
}]
```

`Reporting API` 旨在与你的Web应用配合使用。浏览器捕获，排队和批处理，然后在最合适的时间自动发送报告。报告是由浏览器在内部发送的，因此使用 `Reporting API` 时几乎没有性能问题（例如与应用程序发生网络争用）。也没有办法控制浏览器何时发送排队的报告。

## 上报 CSP

在以前，我们可以给 CSP 增加一个 `report-uri` 来上报问题：

```
Content-Security-Policy: ...; report-uri https://example.com/csp-reports
Content-Security-Policy-Report-Only: ...; report-uri https://example.com/csp-report
```

下面是一个使用 `Report-To` 上报 `CSP` 问题的例子：

```json
Content-Security-Policy-Report-Only: ...; report-to csp-endpoint
​
Report-To: {
    ...
  }, {
    "group": "csp-endpoint",
    "max_age": 10886400,
    "endpoints": [{
      "url": "https://example.com/csp-reports"
    }]
  }
```

> 为了向后兼容，请与 report-uri 一起继续使用 report-to。换句话说：Content-Security-Policy: ...; report-uri <https://example.com/csp-reports>; report-to groupname。支持的浏览器 report-to 将使用它代替report-uri。

## 上报网络错误

网络错误日志(NEL)规范定义了一种从源头收集客户端网络错误的机制。它使用新的 `NEL HTTP` 响应头来设置，告诉浏览器收集网络错误，然后与 `Reporting API` 集成，将错误报告给服务器。

要使用 `NEL`，首先使用一个使用命名组的收集器设置报告头:

```
Report-To: {
    ...
  }, {
    "group": "network-errors",
    "max_age": 2592000,
    "endpoints": [{
      "url": "https://analytics.provider.com/networkerrors"
    }]
  }
```

接下来，发送NEL响应头以开始收集错误。

```
GET /index.html HTTP/1.1
NEL: {"report_to": "network-errors", "max_age": 2592000}
```

## ReportingObserver

`ReportingObserver` 和 `Report-To` 报头具有类似但略微不同的用途。

`ReportingObserver` 是一个 `JavaScript API`，可以观察到简单的客户端警告，例如弃用和干预。报表不会自动发送到服务器（除非你在回调中触发）：

```
const observer = new ReportingObserver((reports, observer) => {
  for (const report of reports) {
    // Send report somewhere.
  }
}, {buffered: true});
​
observer.observe();
```

更敏感的错误类型，如CSP违规和网络错误不能被 `ReportingObserver` 观察到。

`Report-To` 更加强大，因为它可以捕获更多类型的错误报告(网络，CSP，浏览器崩溃)，除了 `ReportingObserver` 支持的那些。当你想要自动向服务器报告错误或捕获在 `JavaScript` 中不可能看到的错误(网络错误)时，可以使用它。

## 总结

`Reporting API` 无疑是做端监控同学的福音，它省去了我们很多需要在前端监控中需要自己做的工作，未来浏览器还会将更多的上报类型应用到 `Reporting API` ，未来将会作为诊断网站问题的重点工具。



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
