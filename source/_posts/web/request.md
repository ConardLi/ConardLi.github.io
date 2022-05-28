---
title: 全面分析前端的网络请求方式
category: Web
tag: 
- Web安全
- 网络请求
- 工程实践
date: 2019-03-27
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



## 一、前端进行网络请求的关注点

大多数情况下，在前端发起一个网络请求我们只需关注下面几点：

- 传入基本参数（`url`，请求方式）
- 请求参数、请求参数类型
- 设置请求头
- 获取响应的方式
- 获取响应头、响应状态、响应结果
- 异常处理
- 携带`cookie`设置
- 跨域请求

## 二、前端进行网络请求的方式

- `form`表单、`ifream`、刷新页面
- `Ajax` - 异步网络请求的开山鼻祖
- `jQuery` - 一个时代
- `fetch` - `Ajax`的替代者
- `axios、request`等众多开源库

## 三、关于网络请求的疑问

- `Ajax`的出现解决了什么问题
- 原生`Ajax`如何使用
- `jQuery`的网络请求方式
- `fetch`的用法以及坑点
- 如何正确的使用`fetch`
- 如何选择合适的跨域方式

带着以上这些问题、关注点我们对几种网络请求进行一次全面的分析。

## 四、Ajax的出现解决了什么问题

在`Ajax`出现之前，`web`程序是这样工作的：

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc95733e5eca8~tplv-t2oaga2asx-image.image)

这种交互的的缺陷是显而易见的，任何和服务器的交互都需要刷新页面，用户体验非常差，`Ajax`的出现解决了这个问题。`Ajax`全称`Asynchronous JavaScript + XML`（异步`JavaScript`和`XML`）

使用`Ajax`，网页应用能够快速地将增量更新呈现在用户界面上，而不需要重载（刷新）整个页面。

`Ajax`本身不是一种新技术，而是用来描述一种使用现有技术集合实现的一个技术方案，浏览器的`XMLHttpRequest`是实现`Ajax`最重要的对象（`IE6`以下使用`ActiveXObject`）。


尽管`X`在`Ajax`中代表`XML`, 但由于`JSON`的许多优势，比如更加轻量以及作为`Javascript`的一部分，目前`JSON`的使用比`XML`更加普遍。



## 五、原生Ajax的用法

这里主要分析`XMLHttpRequest`对象，下面是它的一段基础使用：

```js
        var xhr = new XMLHttpRequest();
        xhr.open('post','www.xxx.com',true)
        // 接收返回值
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 ){
                if(xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
                    console.log(xhr.responseText);
                }
            }
        }
        // 处理请求参数
        postData = {"name1":"value1","name2":"value2"};
        postData = (function(value){
        var dataString = "";
        for(var key in value){
             dataString += key+"="+value[key]+"&";
        };
          return dataString;
        }(postData));
        // 设置请求头
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        // 异常处理
        xhr.onerror = function() {
           console.log('Network request failed')
        }
        // 跨域携带cookie
        xhr.withCredentials = true;
        // 发出请求
        xhr.send(postData);
```
下面分别对`XMLHttpRequest`对象常用的的函数、属性、事件进行分析。

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc95733923d9c~tplv-t2oaga2asx-image.image)

### 函数

**open**

用于初始化一个请求，用法：

```js
xhr.open(method, url, async);
```

- `method`：请求方式，如`get、post`
- `url`：请求的`url`
- `async`：是否为异步请求

**send**

用于发送` HTTP `请求，即调用该方法后`HTTP`请求才会被真正发出，用法：

```js
xhr.send(param)
```

- `param`：http请求的参数，可以为`string、Blob`等类型。


**abort**

用于终止一个`ajax`请求，调用此方法后`readyState`将被设置为`0`，用法：

```js
xhr.abort()
```

**setRequestHeader**

用于设置`HTTP`请求头，此方法必须在`  open() `方法和` send() `之间调用，用法：

```js
xhr.setRequestHeader(header, value);
```

**getResponseHeader**

用于获取`http`返回头，如果在返回头中有多个一样的名称，那么返回的值就会是用逗号和空格将值分隔的字符串，用法：

```js
var header = xhr.getResponseHeader(name);
```

### 属性

**readyState**

用来标识当前`XMLHttpRequest`对象所处的状态，`XMLHttpRequest`对象总是位于下列状态中的一个：

|值|状态|描述
|-|-|-|
|0 |	`UNSENT`	|代理被创建，但尚未调用 `open()` 方法。
|1 |	`OPENED`	|`open()` 方法已经被调用。
|2 |	`HEADERS_RECEIVED` |	`send() `方法已经被调用，并且头部和状态已经可获得。
|3 |	`LOADING` |	下载中； `responseText` 属性已经包含部分数据。
|4 |	`DONE` |	下载操作已完成。


**status**

表示`http`请求的状态, 初始值为`0`。如果服务器没有显式地指定状态码, 那么`status`将被设置为默认值, 即`200`。

**responseType**

表示响应的数据类型，并允许我们手动设置，如果为空，默认为`text`类型，可以有下面的取值：

|值	|描述|
|-|-|-|
|`""`|	将 `responseType `设为空字符串与设置为`"text"`相同， 是默认类型 （实际上是 `DOMString`）。
|`"arraybuffer"`|	`response` 是一个包含二进制数据的` JavaScript ArrayBuffer` 。
|`"blob"`|`	response `是一个包含二进制数据的 `Blob` 对象 。
|`"document"`|	response 是一个` HTML Document `或` XML XMLDocument `，这取决于接收到的数据的 MIME 类型。
|`"json"`|`	response` 是一个 JavaScript 对象。这个对象是通过将接收到的数据类型视为` JSON `解析得到的。
|`"text"`|`	response `是包含在` DOMString `对象中的文本。

**response**

返回响应的正文，返回的类型由上面的`responseType`决定。


**withCredentials**

`ajax`请求默认会携带同源请求的`cookie`，而跨域请求则不会携带`cookie`，设置`xhr`的`withCredentials`的属性为`true`将允许携带跨域`cookie`。

### 事件回调

**onreadystatechange**

```js
 xhr.onreadystatechange = callback;
```

当`readyState `属性发生变化时，callback会被触发。

**onloadstart**

```js
 xhr.onloadstart = callback;
```

在`ajax`请求发送之前（`readyState==1`后, `readyState==2`前），`callback`会被触发。

**onprogress**

```js
xhr.onprogress = function(event){
  console.log(event.loaded / event.total);
}
```

回调函数可以获取资源总大小`total`，已经加载的资源大小`loaded`，用这两个值可以计算加载进度。

**onload**

```js
 xhr.onload = callback;
```

当一个资源及其依赖资源已完成加载时，将触发`callback`，通常我们会在`onload`事件中处理返回值。


### 异常处理

**onerror**

```js
 xhr.onerror = callback;
```
当`ajax`资源加载失败时会触发`callback`。

**ontimeout**

```js
 xhr.ontimeout = callback;
```

当进度由于预定时间到期而终止时，会触发`callback`，超时时间可使用`timeout`属性进行设置。


## 六、jQuery对Ajax的封装

在很长一段时间里，人们使用`jQuery`提供的`ajax`封装进行网络请求，包括`$.ajax、$.get、$.post`等，这几个方法放到现在，我依然觉得很实用。

```js
$.ajax({
    dataType: 'json', // 设置返回值类型
    contentType: 'application/json', // 设置参数类型
    headers: {'Content-Type','application/json'},// 设置请求头
    xhrFields: { withCredentials: true }, // 跨域携带cookie
    data: JSON.stringify({a: [{b:1, a:1}]}), // 传递参数
    error:function(xhr,status){  // 错误处理
       console.log(xhr,status);
    },
    success: function (data,status) {  // 获取结果
       console.log(data,status);
    }
})
```

`$.ajax`只接收一个参数，这个参数接收一系列配置，其自己封装了一个`jqXHR`对象，有兴趣可以阅读一下[jQuary-ajax 源码](https://github.com/jquery/jquery/blob/master/src/ajax.js)

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc957333ae9b0~tplv-t2oaga2asx-image.image)


常用配置：

**url** 

当前页地址。发送请求的地址。

**type** 

类型：`String` 请求方式 (`"POST"` 或` "GET"`)， 默认为 `"GET"`。注意：其它` HTTP `请求方法，如` PUT `和 `DELETE `也可以使用，但仅部分浏览器支持。

**timeout** 

类型：`Number `设置请求超时时间（毫秒）。此设置将覆盖全局设置。

**success** 

类型：`Function` 请求成功后的回调函数。

**jsonp**

在一个`jsonp`请求中重写回调函数的名字。这个值用来替代在`"callback=?"`这种`GET`或`POST`请求中`URL`参数里的`"callback"`部分。

**error** 类型：`Function` 。请求失败时调用此函数。

注意：源码里对错误的判定：

```js
isSuccess = status >= 200 && status < 300 || status === 304;
```

返回值除了这几个状态码都会进`error`回调。

**dataType** 


```js
"xml": 返回 XML 文档，可用 jQuery 处理。
"html": 返回纯文本 HTML 信息；包含的 script 标签会在插入 dom 时执行。
"script": 返回纯文本 JavaScript 代码。不会自动缓存结果。除非设置了 "cache" 参数。注意：在远程请求时(不在同一个域下)，所有 POST 请求都将转为 GET 请求。（因为将使用 DOM 的 script标签来加载）
"json": 返回 JSON 数据 。
"jsonp": JSONP 格式。使用 JSONP 形式调用函数时，如 "myurl?callback=?" jQuery 将自动替换 ? 为正确的函数名，以执行回调函数。
"text": 返回纯文本字符串
```

**data** 

类型：`String` 使用`JSON.stringify`转码

**complete**

类型：`Function `请求完成后回调函数 (请求成功或失败之后均调用)。

**async** 

类型：`Boolean` 默认值:` true`。默认设置下，所有请求均为异步请求。如果需要发送同步请求，请将此选项设置为 `false`。

**contentType** 

类型：`String `默认值: `"application/x-www-form-urlencoded"`。发送信息至服务器时内容编码类型。

键值对这样组织在一般的情况下是没有什么问题的，这里说的一般是，不带嵌套类型`JSON`，也就是 简单的`JSON`，形如这样：

```js
{
    a: 1,
    b: 2,
    c: 3
}
```
但是在一些复杂的情况下就有问题了。 例如在 `Ajax `中你要传一个复杂的 `json` 对像，也就说是对象嵌数组，数组中包括对象，你这样传：` application/x-www-form-urlencoded` 这种形式是没有办法将复杂的` JSON `组织成键值对形式。

```js
{
  data: {
    a: [{
      x: 2
    }]
  }
}
```

可以用如下方式传递复杂的`json`对象

```js
$.ajax({
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({a: [{b:1, a:1}]})
})
```



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
fetch('http://www.xxx.com',options)
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

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc95734434502~tplv-t2oaga2asx-image.image)

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

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc95734bd87f1~tplv-t2oaga2asx-image.image)

由代码可见，`polyfill`主要对`Fetch` API提供的四大对象进行了封装：


### fetch 封装

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc9573518a4f0~tplv-t2oaga2asx-image.image)

代码非常清晰：

- 构造一个`Promise`对象并返回
- 创建一个`Request`对象
- 创建一个`XMLHttpRequest`对象
- 取出`Request`对象中的请求`url`，请求方发，`open`一个`xhr`请求，并将`Request`对象中存储的`headers`取出赋给xhr
- `xhr onload`后取出`response`的`status`、`headers`、`body`封装`Response`对象，调用`resolve`。

### 异常处理

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc95762d99f52~tplv-t2oaga2asx-image.image)

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

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc957671e85ed~tplv-t2oaga2asx-image.image)

在header对象中维护了一个`map`对象，构造函数中可以传入`Header`对象、数组、普通对象类型的`header`，并将所有的值维护到`map`中。

之前在`fetch`函数中看到调用了`header`的`forEach`方法，下面是它的实现：

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc9576b463008~tplv-t2oaga2asx-image.image)

可见`header`的遍历即其内部`map`的遍历。

另外`Header`还提供了`append、delete、get、set`等方法，都是对其内部的`map`对象进行操作。


### Request对象

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc9576cd7afde~tplv-t2oaga2asx-image.image)

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

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc9576d4d713b~tplv-t2oaga2asx-image.image)

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

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc9577052ac36~tplv-t2oaga2asx-image.image)

可见在构造函数中主要对`options`中的`status、statusText、headers、url`等分别做了处理并挂载到`Response`对象上。

构造函数里面并没有对`responseText`的明确处理，最后交给了`_initBody`函数处理，而`Response`并没有主动声明`_initBody`属性，代码最后使用`Response`调用了`Body`函数，实际上`_initBody`函数是通过`Body`函数挂载到`Response`身上的，先来看看`_initBody`函数：

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc95787de7f1c~tplv-t2oaga2asx-image.image)

可见，`_initBody`函数根据`xhr.response`的类型（`Blob、FormData、String...`），为不同的参数进行赋值，这些参数在`Body`方法中得到不同的应用，下面具体看看`Body`函数还做了哪些其他的操作：

![image](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/3/27/169bc9578dea2673~tplv-t2oaga2asx-image.image)

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

## 十二、跨域总结 

谈到网络请求，就不得不提跨域。

浏览器的同源策略限制了从同一个源加载的文档或脚本如何与来自另一个源的资源进行交互。这是一个用于隔离潜在恶意文件的重要安全机制。通常不允许不同源间的读操作。

跨域条件：协议，域名，端口，有一个不同就算跨域。

下面是解决跨域的几种方式：

### nginx


使用`nginx`反向代理实现跨域，参考我这篇文章：[前端开发者必备的nginx知识](https://juejin.im/post/6844903793918738440)

### cors

`CORS`是一个`W3C`标准，全称是"跨域资源共享"`（Cross-origin resource sharing）`。它允许浏览器向跨源服务器，发出`XMLHttpRequest`请求。

服务端设置` Access-Control-Allow-Origin `就可以开启` CORS`。 该属性表示哪些域名可以访问资源，如果设置通配符则表示所有网站都可以访问资源。

```js
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    next();
});
```

### jsonp 

`script`标签的`src`属性中的链接可以访问跨域的`js`脚本，利用这个特性，服务端不再返回`JSON`格式的数据，而是返回一段调用某个函数的`js`代码，在`src`中进行了调用，这样实现了跨域。


`jquery`对`jsonp`的支持：

```js
        $.ajax({
            type : "get",
            url : "http://xxxx"
            dataType: "jsonp",
            jsonp:"callback", 
            jsonpCallback: "doo",
            success : function(data) {
                console.log(data);
            }
        });
```

`fetch、axios`等并没有直接提供对`jsonp`的支持，如果需要使用这种方式，我们可以尝试进行手动封装：

```js
(function (window,document) {
    "use strict";
    var jsonp = function (url,data,callback) {

        // 1.将传入的data数据转化为url字符串形式
        // {id:1,name:'jack'} => id=1&name=jack
        var dataString = url.indexof('?') == -1? '?': '&';
        for(var key in data){
            dataString += key + '=' + data[key] + '&';
        };

        // 2 处理url中的回调函数
        // cbFuncName回调函数的名字 ：my_json_cb_名字的前缀 + 随机数（把小数点去掉）
        var cbFuncName = 'my_json_cb_' + Math.random().toString().replace('.','');
        dataString += 'callback=' + cbFuncName;

        // 3.创建一个script标签并插入到页面中
        var scriptEle = document.createElement('script');
        scriptEle.src = url + dataString;

        // 4.挂载回调函数
        window[cbFuncName] = function (data) {
            callback(data);
            // 处理完回调函数的数据之后，删除jsonp的script标签
            document.body.removeChild(scriptEle);
        }

        document.body.appendChild(scriptEle);
    }

    window.$jsonp = jsonp;

})(window,document)
```

### postMessage跨域

`postMessage()`方法允许来自不同源的脚本采用异步方式进行有限的通信，可以实现跨文本档、多窗口、跨域消息传递。


```js
//捕获iframe
var domain = 'http://scriptandstyle.com';
var iframe = document.getElementById('myIFrame').contentWindow;

//发送消息
setInterval(function(){
	var message = 'Hello!  The time is: ' + (new Date().getTime());
	console.log('blog.local:  sending message:  ' + message);
        //send the message and target URI
	iframe.postMessage(message,domain); 
},6000);
```
```js
//响应事件
window.addEventListener('message',function(event) {
	if(event.origin !== 'http://davidwalsh.name') return;
	console.log('message received:  ' + event.data,event);
	event.source.postMessage('holla back youngin!',event.origin);
},false);
```
`postMessage`跨域适用于以下场景：同浏览器多窗口间跨域通信、`iframe`间跨域通信。

### WebSocket

`WebSocket` 是一种双向通信协议，在建立连接之后，`WebSocket `的 `server `与 `client `都能主动向对方发送或接收数据而不受同源策略的限制。

```js
         function WebSocketTest(){
            if ("WebSocket" in window){
               alert("您的浏览器支持 WebSocket!");
               // 打开一个 web socket
               var ws = new WebSocket("ws://localhost:3000/abcd");
               ws.onopen = function(){
                  // Web Socket 已连接上，使用 send() 方法发送数据
                  ws.send("发送数据");
                  alert("数据发送中...");
               };
               ws.onmessage = function (evt) { 
                  var received_msg = evt.data;
                  alert("数据已接收...");
               };
               ws.onclose = function(){ 
                  // 关闭 websocket
                  alert("连接已关闭..."); 
               };
            } else{
               // 浏览器不支持 WebSocket
               alert("您的浏览器不支持 WebSocket!");
            }
         }
```



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
