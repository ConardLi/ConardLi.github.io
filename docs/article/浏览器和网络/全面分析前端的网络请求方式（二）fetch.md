---
title: 全面分析前端的网络请求方式（二）fetch
date: 2019-03-28 20:38:59
tags:
     - 浏览器和网络
---


## 七、jQuery的替代者

近年来前端`MV*`的发展壮大，人们越来越少的使用`jQuery`，我们不可能单独为了使用`jQuery`的`Ajax api`来单独引入他，无可避免的，我们需要寻找新的技术方案。

尤雨溪在他的文档中推荐大家用`axios`进行网络请求。`axios`基于`Promise`对原生的`XHR`进行了非常全面的封装，使用方式也非常的优雅。另外，`axios`同样提供了在`node`环境下的支持，可谓是网络请求的首选方案。

未来必定还会出现更优秀的封装，他们有非常周全的考虑以及详细的文档，这里我们不多做考究，我们把关注的重点放在更底层的API`fetch`。

`Fetch API `是一个用用于访问和操纵HTTP管道的强大的原生 API。

> 这种功能以前是使用  XMLHttpRequest实现的。Fetch提供了一个更好的替代方法，可以很容易地被其他技术使用，例如 Service Workers。Fetch还提供了单个逻辑位置来定义其他HTTP相关概念，例如CORS和HTTP的扩展。

可见`fetch`是作为`XMLHttpRequest`的替代品出现的。

使用`fetch`，你不需要再额外加载一个外部资源。但它还没有被浏览器完全支持，所以你仍然需要一个` polyfill`。

## 八、fetch的使用

一个基本的 fetch请求：

```js
const options = {
    method: "POST", // 请求参数
    headers: { "Content-Type": "application/json"}, // 设置请求头
    body: JSON.stringify({name:'123'}), // 请求参数
    credentials: "same-origin", // cookie设置
    mode: "cors", // 跨域
}
fetch('http://www.xxx.com')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(myJson); // 响应数据
  })
  .catch(function(err){
    console.log(err); // 异常处理
  })
```

`Fetch API`提供了一个全局的`fetch()`方法，以及几个辅助对象来发起一个网络请求。

![image](/img/wl/wlqq_4.png)

- `fetch()`

`fetch()`方法用于发起获取资源的请求。它返回一个` promise`，这个 `promise` 会在请求响应后被 `resolve`，并传回 `Response` 对象。

- `Headers`

可以通过` Headers() `构造函数来创建一个你自己的` headers `对象，相当于 `response/request` 的头信息，可以使你查询到这些头信息，或者针对不同的结果做不同的操作。
```js
var myHeaders = new Headers();
myHeaders.append("Content-Type", "text/plain");
```
- `Request`

通过` Request() `构造函数可以创建一个`Request `对象，这个对象可以作为`fetch`函数的第二个参数。

- `Response`

在`fetch()`处理完`promises`之后返回一个`Response `实例，也可以手动创建一个`Response`实例。



## 九、fetch polyfill源码分析

由于`fetch`是一个非常底层的`API`，所以我们无法进一步的探究它的底层，但是我们可以借助它的`polyfill`探究它的基本原理，并找出其中的坑点。

### 代码结构

![image](/img/wl/wlqq_5.png)

由代码可见，`polyfill`主要对`Fetch` API提供的四大对象进行了封装：


### fetch 封装

![image](/img/wl/wlqq_6.png)

代码非常清晰：

- 构造一个`Promise`对象并返回
- 创建一个`Request`对象
- 创建一个`XMLHttpRequest`对象
- 取出`Request`对象中的请求`url`，请求方发，`open`一个`xhr`请求，并将`Request`对象中存储的`headers`取出赋给xhr
- `xhr onload`后取出`response`的`status`、`headers`、`body`封装`Response`对象，调用`resolve`。

### 异常处理

![image](/img/wl/wlqq_7.png)

可以发现，调用`reject`有三种可能：

- 1.请求超时

- 2.请求失败

注意：当和服务器建立简介，并收到服务器的异常状态码如`404、500`等并不能触发`onerror`。当网络故障时或请求被阻止时，才会标记为 `reject`，如跨域、`url`不存在，网络异常等会触发`onerror`。

所以使用fetch当接收到异常状态码都是会进入then而不是catch。这些错误请求往往要手动处理。

- 3.手动终止

可以在`request`参数中传入`signal`对象，并对`signal`对象添加`abort`事件监听，当`xhr.readyState`变为`4`（响应内容解析完成）后将signal对象的abort事件监听移除掉。

这表示，在一个`fetch`请求结束之前可以调用`signal.abort`将其终止。在浏览器中可以使用`AbortController()`构造函数创建一个控制器，然后使用`AbortController.signal`属性

> 这是一个实验中的功能，此功能某些浏览器尚在开发中


### Headers封装

![image](/img/wl/wlqq_8.png)

在header对象中维护了一个`map`对象，构造函数中可以传入`Header`对象、数组、普通对象类型的`header`，并将所有的值维护到`map`中。

之前在`fetch`函数中看到调用了`header`的`forEach`方法，下面是它的实现：

![image](/img/wl/wlqq_9.png)

可见`header`的遍历即其内部`map`的遍历。

另外`Header`还提供了`append、delete、get、set`等方法，都是对其内部的`map`对象进行操作。


### Request对象

![image](/img/wl/wlqq_10.png)

`Request`对象接收的两个参数即`fetch`函数接收的两个参数，第一个参数可以直接传递`url`，也可以传递一个构造好的`request`对象。第二个参数即控制不同配置的`option`对象。

可以传入`credentials、headers、method、mode、signal、referrer`等属性。

这里注意：

- 传入的`headers`被当作`Headers`构造函数的参数来构造header对象。

### cookie处理

fetch函数中还有如下的代码：

```js
    if (request.credentials === 'include') {
      xhr.withCredentials = true
    } else if (request.credentials === 'omit') {
      xhr.withCredentials = false
    }
```

默认的`credentials`类型为`same-origin`,即可携带同源请求的coodkie。

然后我发现这里polyfill的实现和[MDN-使用Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)以及很多资料是不一致的：

> mdn: 默认情况下，fetch 不会从服务端发送或接收任何 cookies 

于是我分别实验了下使用`polyfill`和使用原生`fetch`携带cookie的情况，发现在不设置`credentials`的情况下居然都是默认携带同源`cookie`的，这和文档的说明说不一致的，查阅了许多资料后都是说`fetch`默认不会携带cookie，下面是使用原生`fetch`在浏览器进行请求的情况：

![image](/img/wl/wlqq_11.jpeg)

然后我发现在[MDN-Fetch-Request](https://developer.mozilla.org/zh-CN/docs/Web/API/Request/credentials)已经指出新版浏览器`credentials`默认值已更改为`same-origin`，旧版依然是`omit`。

确实[MDN-使用Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)这里的文档更新的有些不及时，误人子弟了...


### Response对象

`Response`对象是`fetch`调用成功后的返回值：

回顾下`f`etch`中对`Response`的操作：

```js
    xhr.onload = function () {
      var options = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
      }
      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
      var body = 'response' in xhr ? xhr.response : xhr.responseText
      resolve(new Response(body, options))
    }
```
`Response`构造函数：

![image](/img/wl/wlqq_12.png)

可见在构造函数中主要对`options`中的`status、statusText、headers、url`等分别做了处理并挂载到`Response`对象上。

构造函数里面并没有对`responseText`的明确处理，最后交给了`_initBody`函数处理，而`Response`并没有主动声明`_initBody`属性，代码最后使用`Response`调用了`Body`函数，实际上`_initBody`函数是通过`Body`函数挂载到`Response`身上的，先来看看`_initBody`函数：

![image](/img/wl/wlqq_13.png)

可见，`_initBody`函数根据`xhr.response`的类型（`Blob、FormData、String...`），为不同的参数进行赋值，这些参数在`Body`方法中得到不同的应用，下面具体看看`Body`函数还做了哪些其他的操作：

![image](/img/wl/wlqq_14.png)

`Body`函数中还为`Response`对象挂载了四个函数，`text、json、blob、formData`，这些函数中的操作就是将_initBody中得到的不同类型的返回值返回。

这也说明了，在`fetch`执行完毕后，不能直接在`response`中获取到返回值而必须调用`text()、json()`等函数才能获取到返回值。

这里还有一点需要说明：几个函数中都有类似下面的逻辑：

```js
    var rejected = consumed(this)
    if (rejected) {
      return rejected
    }
```
consumed函数：
```js
function consumed(body) {
  if (body.bodyUsed) {
    return Promise.reject(new TypeError('Already read'))
  }
  body.bodyUsed = true
}
```

每次调用`text()、json()`等函数后会将`bodyUsed`变量变为`true`，用来标识返回值已经读取过了，下一次再读取直接抛出`TypeError('Already read')`。这也遵循了原生`fetch`的原则：

> 因为Responses对象被设置为了 stream 的方式，所以它们只能被读取一次



## 十、fetch的坑点

`VUE`的文档中对`fetch`有下面的描述：

> 使用`fetch`还有很多别的注意事项，这也是为什么大家现阶段还是更喜欢` axios` 多一些。当然这个事情在未来可能会发生改变。

由于`fetch`是一个非常底层的`API`，它并没有被进行很多封装，还有许多问题需要处理：

- 不能直接传递`JavaScript`对象作为参数
- 需要自己判断返回值类型，并执行响应获取返回值的方法
- 获取返回值方法只能调用一次，不能多次调用
- 无法正常的捕获异常
- 老版浏览器不会默认携带`cookie`
- 不支持`jsonp`


## 十一、对fetch的封装

### 请求参数处理

支持传入不同的参数类型：
```js
function stringify(url, data) {
  var dataString = url.indexOf('?') == -1 ? '?' : '&';
  for (var key in data) {
    dataString += key + '=' + data[key] + '&';
  };
  return dataString;
}

if (request.formData) {
  request.body = request.data;
} else if (/^get$/i.test(request.method)) {
  request.url = `${request.url}${stringify(request.url, request.data)}`;
} else if (request.form) {
  request.headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
  request.body = stringify(request.data);
} else {
  request.headers.set('Content-Type', 'application/json;charset=UTF-8');
  request.body = JSON.stringify(request.data);
}
```

### cookie携带

`fetch`在新版浏览器已经开始默认携带同源`cookie`，但在老版浏览器中不会默认携带，我们需要对他进行统一设置：

```js
  request.credentials =  'same-origin'; // 同源携带
  request.credentials =  'include'; // 可跨域携带
```


### 异常处理

> 当接收到一个代表错误的 HTTP 状态码时，从 fetch()返回的 Promise 不会被标记为 reject， 即使该 HTTP 响应的状态码是 404 或 500。相反，它会将 Promise 状态标记为 resolve （但是会将 resolve 的返回值的 ok 属性设置为 false ），仅当网络故障时或请求被阻止时，才会标记为 reject。

因此我们要对`fetch`的异常进行统一处理

```js
.then(response => {
  if (response.ok) {
    return Promise.resolve(response);
  }else{
    const error = new Error(`请求失败! 状态码: ${response.status}, 失败信息: ${response.statusText}`);
    error.response = response;
    return Promise.reject(error);
  }
});
```

### 返回值处理

对不同的返回值类型调用不同的函数接收，这里必须提前判断好类型，不能多次调用获取返回值的方法：

```js
.then(response => {
  let contentType = response.headers.get('content-type');
  if (contentType.includes('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
});
```

### jsonp

`fetch`本身没有提供对`jsonp`的支持，`jsonp`本身也不属于一种非常好的解决跨域的方式，推荐使用`cors`或者`nginx`解决跨域，具体请看下面的章节。


fetch封装好了，可以愉快的使用了。

嗯，axios真好用...


文中如有错误，欢迎在评论区指正，谢谢阅读。