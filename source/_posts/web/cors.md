---
title: 跨域的请求在服务端会不会真正执行？
category: Web
tag: 
- Web安全
- 浏览器策略
date: 2022-04-05	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。





上周在群里提了个问题，这是我平时面试经常会问到的一个问题，引起了大家非常激烈的讨论。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/37b714ba77174b7d8be5fba9bccdf4f8~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f3bcb2982ae4043a27b4df8780970e5~tplv-k3u1fbpfcp-zoom-1.image)


这个问题看似简单，但是其实这一个问题就足以看出大家对跨域的理解，如果平时只是了解了个概念， 那这个问题大概率不会答的那么好。

先揭晓一下答案，请求有的时候会被执行，有的时候不会执行。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ceef9eda2ba4977a81e78e60491eb43~tplv-k3u1fbpfcp-zoom-1.image)


那啥时候会执行，啥时候不会执行呢？其实这个问题主要要从以下几个方面去考虑：

- 跨域究竟是谁的策略？
- 在什么时机会拦截请求？
- 究竟什么时候会发预检请求？
- 如果有预检，请求什么时候会被真正执行？


## 跨域请求的拦截

有同学上来就答，一定不会执行的，请求在服务端就会被拦截！

这回答张口就来啊，先想想，服务端有什么责任和义务对跨域的请求做拦截呢？

首先我们俗称的跨域，也就是浏览器的 `同源策略`，直接看 MDN 的解释吧：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04a926c600d845d6aadef14a795a5c29~tplv-k3u1fbpfcp-zoom-1.image)


人家那么大个标题告诉你了，这很明显是个浏览器的策略啊，干服务端啥事呢？

如果服务端拦截，那每个每个 `Server` 都要专门要为浏览器实现一个拦截策略，这根本不现实。

另外，服务端就算是想拦截，也没法判断请求是否跨域，`HTTP Reqeust` 的所有 `Header` 都是可以被篡改的，它用什么去判断请求是否跨域呢？很明显服务端心有余而力不足啊！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/422c03fdcab64b68bac78c93f6276530~tplv-k3u1fbpfcp-zoom-1.image)

## 在什么时候拦截

好了，知道服务端不会拦截了，有小朋友又跳出来抢答了：请求在浏览器发出去之前就被浏览器拦截了，请求根本发不出去！


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c298a9b67b04d7d989c2f49bc1868ef~tplv-k3u1fbpfcp-zoom-1.image)

这个问题先放放，大家可能都看过《解决跨域问题的XXX种方式》这样的文章，一般文章里都会告诉你用 `CORS` 去解决跨域。

大概的原理就是客户端会通过服务端返回的一些 `Header` 去判断该请求是否允许跨域：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c302912a4104eab8d922344598132ee~tplv-k3u1fbpfcp-zoom-1.image)


比如，`Access-Control-Allow-Origin` 告诉客户端允许请求在哪些 `Origin` 下被发送，这些 `Header` 一般都是我们配在 `Server` 上的。

回到上面的问题，如果请求没发出去，这个 `Header` 是怎么被带回来的呢？浏览器又咋知道 `Server` 允许请求在哪些 `Origin` 下跨域发送呢？

所以，我们又明确了一个信息：请求一定是先发出去，在返回来的时候被浏览器拦截了，如果请求是有返回值的，会被浏览器隐藏掉。

## 预检请求

那这么说，请求既然被发出去了，服务端又不会拦截，所以一定会被执行喽？

那当然不是，我们再回来把 `CORS` 这张图放大来看：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f1166f81231743caa11f4346f4a1fbba~tplv-k3u1fbpfcp-zoom-1.image)

我们发现，在发送真正的请求之前，浏览器会先发送一个 `Preflight` 请求，也就是我们常说的预检请求，它的方法为 `OPTIONS`。

这也就是为什么有的时候我们明明只发了一个请求，在 `Network` 里却看到两个：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e4e13d6a0df445689a31321db9af4f4~tplv-k3u1fbpfcp-zoom-1.image)


预检请求有一个很重要的作用就是 `询问` 服务端是不是允许这次请求，如果当前请求是个跨域的请求，你可以理解为：`询问` 服务端是不是允许请求在当前域下跨域发送。

当然，它还有其他的作用，比如 `询问` 服务端支持哪些 HTTP 方法。

## 预检的过程

当预检请求到达服务端时，服务端是不会真正执行这个请求的逻辑的，只会在这个请求上返回一些 `HTTP Header`，以此来告诉客户端是不是要发送真正的请求。

如果服务端告诉客户端，请求是允许被发送的，那真正的请求才会发出去。


比如：我在 `a.com` 这个 `origin` 下，发送了 `conardli.top` 这个域名的请求。

那么浏览器会先向  `conardli.top`  发送一个预检，预检请求不会真正执行这个域名的请求，而是返回了一些 `CORS Header`，比如 `Access-Control-Allow-Origin: a.com`

这时候浏览器发现， `conardli.top` 的请求是允许在 `a.com` 下发送的，才会真正发出请求。这时服务端才会真正执行请求接口的逻辑。

那么，所有的请求都会有预检吗？当然不是。

## 简单请求和复杂请求

预检请求虽然不会真正在服务端执行逻辑，但也是一个请求啊，考虑到服务端的开销，不是所有请求都会发送预检的。
 
一旦浏览器把请求判定为 `简单请求`，浏览器就不会发送预检了。

浏览器判定请求是否为简单请求要同时满足以下四个条件：

- 使用下列方法之一：
  - `GET`
  - `HEAD`
  - `POST`
- 只使用了如下的安全 `Header`，不得人为设置其他 `Header`
  - `Accept`
  - `Accept-Language`
  - `Content-Language`
  - `Content-Type` 的值仅限于下列三者之一：
    - `text/plain`
    - `multipart/form-data`
    - `application/x-www-form-urlencoded`
- 请求中的任意 `XMLHttpRequest` 对象均没有注册任何事件监听器；`XMLHttpRequest` 对象可以使用 `XMLHttpRequest.upload` 属性访问。
- 请求中没有使用 `ReadableStream` 对象。

所以，如果你发送的是一个简单请求，这个请求不管是不是会受到跨域的限制，只要发出去了，一定会在服务端被执行，浏览器只是隐藏了返回值而已。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d0f8a7347cf48ffa93d60bda429195e~tplv-k3u1fbpfcp-zoom-1.image)

现在，一切都清晰了吧 ...

## 总结

最后来总结下要点：

- 简单请求：不管是否跨域，只要发出去了，一定会到达服务端并被执行，浏览器只会隐藏返回值
- 复杂请求：先发预检，预检不会真正执行业务逻辑，预检通过后才会发送真正请求并在服务端被执行



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
