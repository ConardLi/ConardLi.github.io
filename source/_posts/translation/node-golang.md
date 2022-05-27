---
title: 在 Node.js 中引入 Golang ，会让它更快吗？
category: 翻译
tag: 
- Node.js
- WebAssembly
date: 2021-12-28	
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


今天我们来看个有意思的话题，在 `Node.js` 中引入 `Golang` ，会让服务更快吗？

我们都知道，`Nodejs` 适合 `I/O` 密集型任务，但不适合 `CPU` 密集型任务。同时，我们有很多方式来处理此类任务（子进程/集群、工作线程）。此外，还有可能使用其他语言（`C、C++、Rust、Golang`）作为单独的服务/微服务或通过 `WebAssembly` 脚本进行调用。

这篇文章并不是一个 `Node.js` 和 `Golang` 的语言对比，而是在 `Node.js` 开发服务的角度，尝试在某些场景下引入 `Golang`（让它去执行一些 CPU 密集型操作），看看会不会更快。

之前我也写过一篇，在 `React` 项目中引入 `Rust` 的文章，感兴趣可以看：[使用 Rust 编写更快的 React 组件](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247491029&idx=1&sn=b9557294005a6ecce9dc5395d8425157&chksm=c2e2e8fef59561e85af97e6987a4a4f1c448110ad748857435d6552edbc19ef4d9a7215162d8&token=1059614137&lang=zh_CN#rd)

最近发现了一个老外做了在 `Node.js` 服务中引入 `Golang` 的性能测试（https://blog.devgenius.io/node-js-in-go-we-trust-7da6395776f2），挺有意思的，遂翻译了一下。

## 测试项

- 1. 尝试仅使用 `Node.js` 解决 CPU 密集型任务
- 2. 创建单独使用 `的Golang` 编写的服务，并通过发送请求或消息队列的方式将其连接到应用里面
- 3. 使用 `Golang` 构建 `wasm` 文件以运行 `Node.js` 中的某些方法

## 速度与金钱

我是老式意大利西部片的粉丝，尤其是`《The Good, the Bad and the Ugly》`。我们在本文中我们有 3 个测试项，对应电影中的 3 个英雄。



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/77892fd2f0f345a4b10951b2deaa76b5~tplv-k3u1fbpfcp-zoom-1.image)

### Node.js（好人）

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cecfed9b312d4819a2f5ebf50d396a26~tplv-k3u1fbpfcp-zoom-1.image)

优点：
- 1. 前后端使用相同的语言
- 2. `I/O` 操作大师 - 超快的事件循环
- 3. 最大的武器库 - `npm`


### Golang（坏人）

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/adced894b8204636b3df6a64a1244059~tplv-k3u1fbpfcp-zoom-1.image)

优点：
- 1. 由 `Google` 设计
- 2. 几乎所有操作系统都支持
- 3. “Goroutines” - `Golang` 中的特殊函数，可以与其他函数或方法同时运行（适用于 `CPU` 密集型任务）
- 4. 简单 - 只有 25 个关键词


### nodejs-golang/WebAssembly（丑陋的人）


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f24eed003516448d8e6b247ea3f87128~tplv-k3u1fbpfcp-zoom-1.image)


优点：
- 1. 随处可用
- 2. 补充 `JavaScript`
- 3. 可以用不同的语言编写代码并在 `JavaScript` 中使用 `.wasm` 脚本

最后这个测试项我们重点聊聊：

通过将操作系统设置为 `“js”` 并将架构设置为 `“wasm”``（所有的 `GOOS` 和 `GOARCH` 值列表在这里 https://go.dev/doc/install/source#environment ），可以将 Golang 代码构建为 .wasm 文件：

```
GOOS=js GOARCH=wasm go build -o main.wasm
```

要运行编译后的 `Go` 代码，你需要 `wasm_exec.js` 中的 `glue code` 。它在这里找到：

```
${GOROOT}/misc/wasm/wasm_exec.js
```

为了实例化，我使用了 `@assemblyscript/loader` 并创建了一个 `nodejs-golang` 模块（顺便说一句，`@assemblyscript/loader` 是它的唯一依赖项）。这个模块有助于创建、构建和运行可在 `JavaScript` 代码中使用的单独的 `wasm` 脚本或函数

```js
require('./go/misc/wasm/wasm_exec');
const go = new Go();
...
const wasm = fs.readFileSync(wasmPath);
const wasmModule = await loader.instantiateStreaming(wasm, go.importObject);
go.run(wasmModule.instance);
```

顺便说一句，其他语言可以以相同的方式用于创建 `.wasm` 文件。

```
C: emcc hello.c -s WASM=1 -o code秘密花园.html

C++: em++ hello.cpp -s WASM=1 -o code秘密花园.html

Rust： cargo build --target wasm --release
```


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/270eb183927e499bb80141a48b32cf8b~tplv-k3u1fbpfcp-zoom-1.image)

## 让我们来看看谁是狂野西部最快的枪……

为此，我们需要创建 2 个服务器

### 1.Golang服务器

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/471c112510154a5d9451c6a16698de1c~tplv-k3u1fbpfcp-zoom-1.image)

```go
package main

import (
    ...
    "fmt"
    ...
    "net/http"
    ...
)

func main() {
    ...
    fmt.Print("Golang: Server is running at http://localhost:8090/")
    http.ListenAndServe(":8090", nil)
}
```

### 2. Node.js 服务器

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05775b753b6044ab88bcd3cc96e14e33~tplv-k3u1fbpfcp-zoom-1.image)


```js
const http = require('http');
...
(async () => {
  ...
  http.createServer((req, res) => {
    ...
  })
  .listen(8080, () => {
    console.log('Nodejs: Server is running at http://localhost:8080/');
  });
})();
```


我们将测试每个任务的执行时间，注意：

- 对于 `Golang` 服务器，它的延迟将是函数的直接执行时间 + 网络请求延迟
- 而对于 `Node.js` 和 `WebAssembly`，它将只是函数的执行时间


## 最后的决斗

### 1.“ping”请求

只是检查一下一个请求执行将花费多少时间


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/56a41157a95941db9266e61137113adc~tplv-k3u1fbpfcp-zoom-1.image)

Node.js

```js
const nodejsPingHandler = (req, res) => {
  console.time('Nodejs: ping');

  const result = 'Pong';

  console.timeEnd('Nodejs: ping');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify({ result }));
  res.end();
};
```

Golang

```js
// golang/ping.js

const http = require('http');

const golangPingHandler = (req, res) => {
  const options = {
    hostname: 'localhost',
    port: 8090,
    path: '/ping',
    method: 'GET',
  };

  let result = '';

  console.time('Golang: ping');

  const request = http.request(options, (response) => {
    response.on('data', (data) => {
      result += data;
    });
    response.on('end', () => {
      console.timeEnd('Golang: ping');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify({ result }));
      res.end();
    });
  });

  request.on('error', (error) => {
    console.error(error);
  });

  request.end();
};
```

```go
// main.go

func ping(w http.ResponseWriter, req *http.Request) {
    fmt.Fprintf(w, "Pong")
}
```

nodejs-golang

```js
// nodejs-golang/ping.js

const nodejsGolangPingHandler = async (req, res) => {
  console.time('Nodejs-Golang: ping');

  const result = global.GolangPing();

  console.timeEnd('Nodejs-Golang: ping');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify({ result }));
  res.end();
};
```

```go
// main.go

package main

import (
    "syscall/js"
)

func GolangPing(this js.Value, p []js.Value) interface{} {
    return js.ValueOf("Pong")
}

func main() {
    c := make(chan struct{}, 0)

    js.Global().Set("GolangPing", js.FuncOf(GolangPing))

    <-c
}
```

结果：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c9d7b56300964e63aa03ee451aad4e3d~tplv-k3u1fbpfcp-zoom-1.image)

### 两个数字的简单求和


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a64a65712644ec2ac07157bda4b6b9c~tplv-k3u1fbpfcp-zoom-1.image)



Node.js
```js
const result = p1 + p2;

```

Golang

```go
func sum(w http.ResponseWriter, req *http.Request) {
    p1, _ := strconv.Atoi(req.URL.Query().Get("p1"))
    p2, _ := strconv.Atoi(req.URL.Query().Get("p2"))

    sum := p1 + p2

    fmt.Fprint(w, sum)
}
````


nodejs-golang

```js
func GolangSum(this js.Value, p []js.Value) interface{} {
    sum := p[0].Int() + p[1].Int()
    return js.ValueOf(sum)
}
```

结果


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4f744bb4e294dd99c51154067f52494~tplv-k3u1fbpfcp-zoom-1.image)



### 计算斐波那契数列（第 100000 个数）


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/49cb9290baac4cbfb629fc9c38b2d62d~tplv-k3u1fbpfcp-zoom-1.image)




Node.js

```js
const fibonacci = (num) => {
  let a = BigInt(1),
    b = BigInt(0),
    temp;

  while (num > 0) {
    temp = a;
    a = a + b;
    b = temp;
    num--;
  }

  return b;
};
```


Golang

```go
func fibonacci(w http.ResponseWriter, req *http.Request) {
    nValue, _ := strconv.Atoi(req.URL.Query().Get("n"))

    var n = uint(nValue)

    if n <= 1 {
        fmt.Fprint(w, big.NewInt(int64(n)))
    }

    var n2, n1 = big.NewInt(0), big.NewInt(1)

    for i := uint(1); i < n; i++ {
        n2.Add(n2, n1)
        n1, n2 = n2, n1
    }

    fmt.Fprint(w, n1)
}
```


nodejs-golang

```go
func GolangFibonacci(this js.Value, p []js.Value) interface{} {
    var n = uint(p[0].Int())

    if n <= 1 {
        return big.NewInt(int64(n))
    }

    var n2, n1 = big.NewInt(0), big.NewInt(1)

    for i := uint(1); i < n; i++ {
        n2.Add(n2, n1)
        n1, n2 = n2, n1
    }

    return js.ValueOf(n1.String())
}
```

结果


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c6da2c3a882b4b71adebfd4380a2252d~tplv-k3u1fbpfcp-zoom-1.image)



### 计算 md5（10k 字符串）

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/413a567a6ab34ac09dcfbe3b8575ba3b~tplv-k3u1fbpfcp-zoom-1.image)


Node.js

```js

const crypto = require('crypto');

const md5 = (num) => {
  for (let i = 0; i < num; i++) {
    crypto.createHash('md5').update('nodejs-golang').digest('hex');
  }
  return num;
};
```


Golang

```go
func md5Worker(c chan string, wg *sync.WaitGroup) {
    hash := md5.Sum([]byte("nodejs-golang"))

    c <- hex.EncodeToString(hash[:])

    wg.Done()
}

func md5Array(w http.ResponseWriter, req *http.Request) {
    n, _ := strconv.Atoi(req.URL.Query().Get("n"))

    c := make(chan string, n)
    var wg sync.WaitGroup

    for i := 0; i < n; i++ {
        wg.Add(1)
        go md5Worker(c, &wg)
    }

    wg.Wait()

    fmt.Fprint(w, n)
}
```


nodejs-golang

```go
func md5Worker(c chan string, wg *sync.WaitGroup) {
    hash := md5.Sum([]byte("nodejs-golang"))

    c <- hex.EncodeToString(hash[:])

    wg.Done()
}

func GolangMd5(this js.Value, p []js.Value) interface{} {
    n := p[0].Int()

    c := make(chan string, n)
    var wg sync.WaitGroup

    for i := 0; i < n; i++ {
        wg.Add(1)
        go md5Worker(c, &wg)
    }

    wg.Wait()

    return js.ValueOf(n)
}
```

结果


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/feaa5390f7a14963b9dea5e49d2a1404~tplv-k3u1fbpfcp-zoom-1.image)


### 计算 sha256（10k 字符串）


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9dd425214fac41ce9e7ab0221094019b~tplv-k3u1fbpfcp-zoom-1.image)


Node.js

```js

const crypto = require('crypto');

const sha256 = (num) => {
  for (let i = 0; i < num; i++) {
    crypto.createHash('sha256').update('nodejs-golang').digest('hex');
  }
  return num;
};
```


Golang

```go
func sha256Worker(c chan string, wg *sync.WaitGroup) {
    h := sha256.New()
    h.Write([]byte("nodejs-golang"))
    sha256_hash := hex.EncodeToString(h.Sum(nil))

    c <- sha256_hash

    wg.Done()
}

func sha256Array(w http.ResponseWriter, req *http.Request) {
    n, _ := strconv.Atoi(req.URL.Query().Get("n"))

    c := make(chan string, n)
    var wg sync.WaitGroup

    for i := 0; i < n; i++ {
        wg.Add(1)
        go sha256Worker(c, &wg)
    }

    wg.Wait()

    fmt.Fprint(w, n)
}
```


nodejs-golang

```go
func sha256Worker(c chan string, wg *sync.WaitGroup) {
    h := sha256.New()
    h.Write([]byte("nodejs-golang"))
    sha256_hash := hex.EncodeToString(h.Sum(nil))

    c <- sha256_hash

    wg.Done()
}

func GolangSha256(this js.Value, p []js.Value) interface{} {
    n := p[0].Int()

    c := make(chan string, n)
    var wg sync.WaitGroup

    for i := 0; i < n; i++ {
        wg.Add(1)
        go sha256Worker(c, &wg)
    }

    wg.Wait()

    return js.ValueOf(n)
}
```



结果


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ed52606b881406b9c4a532ea650a878~tplv-k3u1fbpfcp-zoom-1.image)

## 最终结果


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/54af42dba38c42c7a14e69672a18a889~tplv-k3u1fbpfcp-zoom-1.image)


- 1. `Node.js`，能很好地完成它的工作
- 2. `Golang` 能很好地完成它的工作
- 3. `WebAssembly`（现在还有我的 `nodejs-golang` 模块）能很好地完成它的工作
- 4. `Golang` 可以用作独立应用程序，作为服务/微服务，作为 `wasm` 脚本的源，然后可以在 `JavaScript` 中被调用
- 5 `Node.js`和 `Golang` 都有现成的机制来在 `JavaScript` 中使用 `WebAssembly`

## 结论

> 快是好的，但准确才是一切。 - Wyatt Earp


- 1. 如果有可能不用 `Node.js` 运行 `CPU` 密集型任务 - 最好不要这样做
- 2. 如果你需要在 `Node.js` 中运行 `CPU` 密集型任务 - 可以先尝试使用 `Node.js` 执行此操作，可能性能没有你想象的那么差
- 3. 在性能（使用其他语言）和可读性之间，最好选择可读性。如果你是唯一熟悉这个语言的人，则向项目添加这个新语言并不是一个好主意
- 4. 对我来说，不同语言的服务最好 “保持分离”。你可以尝试为 CPU 密集型计算创建单独的服务或微服务，可以轻松扩展此类服务
- 5. 首先，`WebAssembly` 对于浏览器来说是很好的，`Wasm` 二进制代码比 `JS` 代码更小，更容易解析，向后兼容等等，但是在 Node 服务中可能不是一个很好的选择

> “一个优秀的架构师会假装还没有做出决定，并对系统进行反复的测试和优化，以便这些决定仍然可以尽可能长时间地推迟或更改。优秀的架构师会将未做决策的数量最大化。” - Robert C. Martin 的 Clean Architecture



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
