---
title: 全面分析前端的网络请求方式（一）ajax
date: 2019-03-28 20:38:59
tags:
     - 浏览器和网络
---


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

![image](http://www.conardli.top/img/wl/wlqq_1.png)

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

![image](http://www.conardli.top/img/wl/wlqq_2.png)

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

![image](http://www.conardli.top/img/wl/wlqq_3.png)


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

