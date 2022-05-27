---
title: 详解Spectre漏洞 — 原理+防护方案
category: Web安全
tag: 
- Web安全
- 漏洞原理
date: 2022-03-02
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


我在之前为大家分析过好多浏览器的策略：

- [HTTP 缓存别再乱用了！推荐一个缓存设置的最佳姿势！](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247492849&idx=1&sn=e504a9c18fec71b9644820edf4d94f68&chksm=c2e111daf59698ccf7e546319df00e67dd9406f79477b43c089b38492b533c6ee61b9765e28d&token=1388359418&lang=zh_CN#rd)
- [跨域，不止CORS](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490585&idx=1&sn=50f95cbe025007a0a8d47b4a5afe9b98&chksm=c2e2e932f5956024a2613ea9d21281539ea9a39b22ce2765e92c4c4cb359575bbc1cf3a3c6be&token=260804687&lang=zh_CN#rd)
- [新的跨域策略：使用COOP、COEP为浏览器创建更安全的环境](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490474&idx=1&sn=4be6c15b9077fbcadefd2888ce8885fb&source=41#wechat_redirect)

好多同学看了这几篇文章后表示看的云里雾里的，其实这些策略里面都提到了一个漏洞：`Spectre` 漏洞，这个漏洞究竟有啥魔力，让浏览器频繁的为它更新策略呢，今天我就来给大家讲解一下。

## Spectre

如果一个漏洞很难构造，就算他能够造成再大的危害，可能也不会引起浏览器这么大的重视，那么我们今天的主角 `Spectre` ，是又容易构造，而且造成的危害也很大的，利用  `Spectre` ，你可以：

通过几行 `JavaScript` ，就可以读取到电脑/手机上的所有数据，浏览器中的网页可以读取你所有的密码，知道其他程序在干什么，这甚至不需要你写出来的程序是有漏洞的，因为这是一个计算机硬件层面上的漏洞。


想要理解 `Spectre` ，我们需要下面三个方面的知识：

- 理解什么是旁路攻击
- 理解内存的工作方式
- 理解计算机的预测执行

其实都是一些非常基础的计算机知识，大家可能学校里都学到过的，那么 `Spectre` 则巧妙利用了上面三个原理，下面我们来挨个看一下。

大家可以完全不用担心，我会用最简单的方式给大家讲明白，先把这些知识拆解一下，最后组合起来其实是很容易理解的。

## 内存的工作方式

首先，我们的电脑是由很多零部件构成的：

- 存储：内存、硬盘等等
- CPU
- 输入输出设备：键盘鼠标等

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc60eb31faa0481492e5a1096cd67eb2~tplv-k3u1fbpfcp-zoom-1.image)

我们的计算机运行的时候呢，从存储设备加载程序进入 `CPU`，`CPU` 负责处理进行大量运算，这些运算需要内存的数据进行多次读取。然后把结果输出到我们的显示器等输出设备里面，这大概是是一个计算机简单的工作原理。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e7bbcddd1c84ec49ab764fae90c4daf~tplv-k3u1fbpfcp-zoom-1.image)

下面我们把关注点放到 `CPU` 和内存上面，内存里存放着你正在运行的很多程序，包括系统、用户数据等等、同时也存储了 `CPU` 运算的中间结果。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8296c0e5b28348f48817672de0e5dc14~tplv-k3u1fbpfcp-zoom-1.image)

要存储这么多信息，需要一个规范化的存储方式，我们可以把内存想像成一堆排列好的小的内存块，每个内存块里保存着一位信息。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8b066c4df7c64db2956b062225cfd46b~tplv-k3u1fbpfcp-zoom-1.image)

另外，内存是有很多层的，CPU 去里面读一个数据是很慢的，所以我们又在 CPU 和 内存中建立了几级缓存，当我们取到一个被缓存过的数据时，速度会快一点。那当访问一个没被缓存过的数据时，数据会在缓存内存里创建一个副本，下次再访问到它就会很快。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d95cbdef259449c9815134a9b3fe6ff~tplv-k3u1fbpfcp-zoom-1.image)


这就是内存大概的工作原理，当然这个过程简化了很多，我们在这里只需要简单理解即可。




## 旁路攻击

那么啥是旁路（`side-channel`）呢？

我们可以简单这样理解：假如在你的程序正常的通讯通道之外，产生了一种其他的特征，这些特征反映了你不想产生的信息，这个信息被人拿到了，你就泄密了。这个边缘特征产生的信息通道，就叫旁路。

比如你的内存在运算的时候，产生了一个电波，这个电波反映了内存中的内容的，有人用特定的手段收集到这个电波，这就产生了一个旁路了。基于旁路的攻击，就称为旁路攻击。

常见的旁路还有：时延，异常，能耗，电磁，噪声，可见光，错误消息，频率，等等，反正你运行总是有边缘特征的，一不小心这个边缘特征就成了泄密的机会。

我们来举个基于时延来进行旁路攻击的例子：

假设我们想让电脑验证一下密码，比如我们的密码是 `ConardLi`。

下面我们从攻击者的角度来猜一下，密码是啥，我们从一个字母开始猜：

- 密码是 `A`，计算机 `1ms` 后告诉我：不对！
- 密码是 `B`，计算机 `1ms` 后告诉我：不对！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c7441dd1da094248abe4e44d4a52dbe6~tplv-k3u1fbpfcp-zoom-1.image)

- 密码是 `C`，计算机 `1.1ms` 后告诉我：不对！

有没有发现啥问题？我们第一个字母猜对了，但是计算机告诉我们密码错误的时间增加了 `0.1ms`？


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4a92342b8d04386b15a11e94fe2a83d~tplv-k3u1fbpfcp-zoom-1.image)

因为这次，计算机发现第一位匹配后，需要验证第二位是否匹配，所以会多花费一些时间。是不是很巧妙！


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f1c151dbf5834ec6a9e56853507f3c14~tplv-k3u1fbpfcp-zoom-1.image)


我们可以以同样的方式，再继续验证 `Ca、Cb、... Co`，最终猜测出我们的密码。

这时我们的猜测时间和密码长度是线性关系，我们可以再 O(n) 的时间复杂度内猜出密码。如果直接爆破，我们至少需要进行 52 的 8 次方次计算！


这就是旁路攻击，这该死的魅力！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/54ee100164b148c5baaa99107d02e036~tplv-k3u1fbpfcp-zoom-1.image)


## CPU的预测执行

上面我们提到，当CPU运行的时候，会频繁的从内存中调取信息。但是读取内存很慢，CPU 为此要花费很长的时间空闲，只为了等待内存的数据。这显然不是个很好的方案。

所以，人们想，是不是 CPU 可以推测一下需要执行的命令呢？

假设我们有下面这样的代码，根据内存中的某个数据判断执行不同的语句：

```js
if(Menory === 0){
  // 进行第一步计算
  // 进行第二步计算
  // 进行第三步计算
}
```

这里有两种可能，`Menory` 是 0 或者不是 0 。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51ff0e7145024f519f7d42f6ee16eaf4~tplv-k3u1fbpfcp-zoom-1.image)


这时 `CPU` 等待内存数据时就会预测，假设读取内存返回 0，`CPU` 可以不等待内存返回，直接抢跑：跳过 if 判断直接执行里面的计算命令。

那么如果内存真的返回 0 ，`CPU` 已经成功超前运行，`CPU` 可以继续执行后面的命令。但是假如内存没有返回 0 ，CPU 就会回滚之前执行的结果。

所以，CPU 执行需要非常小心，不能直接覆盖寄存器的值，从而真的改变程序的状态，一旦发现预测失败就立刻回滚改动。

## 攻击的原理

前面，我们已经掌握了这个漏洞利用到的所有因素，下面我们来看看它具体是咋回事。

假设下面是我们的缓存，读取它很慢。系统内核将它进行分块，分配给不同的程序，如果考虑云计算的话，可能分配给不同的虚拟机。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d7213e23d074d8dbe7be62be48fbc26~tplv-k3u1fbpfcp-zoom-1.image)

不同程序可能分配到的内存块是相邻的，我们继续用之前的文章 [HTTP 缓存别再乱用了！推荐一个缓存设置的最佳姿势！](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247492849&idx=1&sn=e504a9c18fec71b9644820edf4d94f68&chksm=c2e111daf59698ccf7e546319df00e67dd9406f79477b43c089b38492b533c6ee61b9765e28d&token=1388359418&lang=zh_CN#rd) 中的例子：

红色的内存块中存储着我们受害者的数据，比如受害者的某个密码：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b00d2e39a8f24e629b5d29c8b81301c6~tplv-k3u1fbpfcp-zoom-1.image)



操作系统会试图确保一个程序无法访问属于其他程序的内存块，不同程序的内存块会被隔离开。

所以其他程序无法直接读取 “受害者”（红色区域）的数据：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dec4d8ff29574f079a0462937e059286~tplv-k3u1fbpfcp-zoom-1.image)


加入我们试图直接访问红色区域肯定是读不到的 ，但是缓存中可能已经存在一些数据，下面我们可以试着用高速缓存来搞点事情。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e7f9838c3b95400aa949eef27a10637f~tplv-k3u1fbpfcp-zoom-1.image)


我们在紫色的内存块放一个数组 A，这块内存属于我们的程序，可以合法访问，但是它很小，只有两位。



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1edd99d293eb4eebade10200d4443b30~tplv-k3u1fbpfcp-zoom-1.image)



但是我们不满足于读取数组 A 中的两个元素，我们试图超出 A 的范围（下标越界），访问 A 数组的第 X 位。但是 X 可能远远超出 A 数组的长度。



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/328825ea28b641f6b1cc0c8b551ff15a~tplv-k3u1fbpfcp-zoom-1.image)





通常情况下， CPU 会阻止这一操作，抛出一个错误：“非法操作”，然后操作会被强制结束 ，然而我们可以再试图观测这个过程，我们看看是怎么做到的。

我们在我们允许访问的内存范围内再次新建一个区域，可以叫工具箱。



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/398f30484a1a480d92994c8224e21a54~tplv-k3u1fbpfcp-zoom-1.image)



我们特别要求 CPU 对这段数据不要拷贝到缓存，只保留于内存，这是一段连续的内存区域。 


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af800745fc2e449caaadfb2a1c9c8078~tplv-k3u1fbpfcp-zoom-1.image)


假设我们执行的指令长这样，首先有个 if 判断语句：

```js
if(name === 'code秘密花园'){
  // ...
}
```

一般来讲，CPU 执行会先无视这个判断，因为它需要等待内存返回 `name` 的值是不是等于 `code秘密花园`，因为有预测执行这样的技术，if 语句中的东西会被预先执行。

```js
if(name === 'code秘密花园'){
  access Tools[A[x]]
}
```

我们尝试读取 `Tools` 的第（A的第X元素）个元素。假如我们读到的这个受害者内存中包含 `3`:



![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a4192f06558d44ddaf28089b3bcef061~tplv-k3u1fbpfcp-zoom-1.image)


这是我们不应该读取到的，但是我们可以通过预测执行做下面的事情： 

`CPU` 执行了这个不应该被执行的命令后，`CPU` 认为它需要看一下 `A[X]` 的值是什么，这时 `CPU` 并未检查 `A[X]` 是否已经下标越界，因为 `CPU` 认为之后内核总会验证下标是否越界，如果越界就强制结束程序。

于是，预测执行就直接查询了 `A[X]` 的值，然后发现 `A[X] = 3 `，也就是：

```js
Tools[A[x]] = Tools[3]
```

也就是我们实际内存中 `Tools` 存储的第四个元素 `a`，下面重点来了：

CPU 访问到 `a` 后，将 `a`（即`Tools[3]`） 放入了高速缓存！ 


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45fc58bda17447b292bc9f2a9a91b872~tplv-k3u1fbpfcp-zoom-1.image)

最后一步，就是遍历 `Tool` 中的每一个元素，我们发现访问前几个元素都有点慢，直到访问到第 3 个突然很快！因为第 3 个元素 `a` 在缓存中存储了一份！

当预测执行发现错误的时候，它就会回滚寄存器的变化，但是不会回滚高速缓存！


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/08f1561134a2432f964ba9dcb2f44789~tplv-k3u1fbpfcp-zoom-1.image)


信息就这样的被泄漏了，因为访问第 `3` 个元素所需时间比其他要短！这也就是基于时间的旁路。

于是，我们知道 “受害者” 在内存的这个位置有个 `3`。

后面，我们可以把 `Tools` 这篇区域搞得更大，你就可以猜出其他更多的数据！当然，这就是实际去攻击需要考虑的失去了～

## 给Web带来的影响

上面的原理我们已经分析清楚了，实际上使用 `JavaScript` 实现这个攻击非常容易，在 `JavaScript` 里几乎所有的边界检查都可以被绕过，从而实现任意内存边界读取。我们可以看看下面这段代码：

```js
if(index < array.length){
  index = array[index | 0];
  index = (((index * TABLE_STRIDE) | 0) & (TABLE_BYTES - 1)) | 0;
  localJunk ^= probeTable[index | 0] | 0;
}
```

来自不同站点的多个页面最终可能会在浏览器中共享一个进程。当一个人使用 `window.open`、 或 `<a href="..." target="_blank">` 或 `iframe` 打开另一个页面时，可能会发生问题，如果一个网站包含特定用户的敏感数据，则另一个网站可能会利用这样的漏洞来读取该用户的数据。

上面只是举了一个简单的例子，其实实际的攻击面要比这个广泛的多，为此浏览器出了很多的安全策略来解决这个问题，下面我们来看看：


## 浏览器策略


### 缓存推荐设置

上一篇文章讲的就是这个 [HTTP 缓存别再乱用了！推荐一个缓存设置的最佳姿势！](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247492849&idx=1&sn=e504a9c18fec71b9644820edf4d94f68&chksm=c2e111daf59698ccf7e546319df00e67dd9406f79477b43c089b38492b533c6ee61b9765e28d&token=1388359418&lang=zh_CN#rd)

- 为了防止中间层缓存，建议设置：`Cache-Control: private`
- 建议设置适当的二级缓存 `key`：如果我们请求的响应是跟请求的 `Cookie` 相关的，建议设置：`Vary: Cookie`

这下应该更明白为要这俩缓存配置了吧，浏览器没有权利把缓存干掉，它只能做到最大程度的收紧缓存的宽松程度，增加攻击的难度。



### 禁用高分辨率计时器

要利用 `Spectre`，攻击者需要精确测量从内存中读取某个值所需的时间。所以需要一个可靠且准确的计时器。

浏览器提供的一个 `performance.now() API` ，时间精度可以精确到 `5` 微秒。作为一种缓解措施，所有主要浏览器都降低了 `performance.now()` 的分辨率，这可以提高攻击的难度。

获得高分辨率计时器的另一种方法是使用 `SharedArrayBuffer`。 `web worker` 使用 `Buffer` 来增加计数器。主线程可以使用这个计数器来实现计时器。浏览器就是因为这个原因禁用了 `SharedArrayBuffer`。



### rel="noopener"

浏览器 `Context Group` 是一组共享相同上下文的 `tab、window` 或 `iframe` 。例如，如果网站（`https://a.example`）打开弹出窗口（`https://b.example`），则打开器窗口和弹出窗口共享相同的浏览上下文，并且它们可以通过 `DOM API` 相互访问，例如 `window.opener`。

所以浏览器推荐大家在打开不信任的外部页面时指定 `rel="noopener"` 。


### 跨源开放者策略（COOP）


利用 `Spectre` ，攻击者可以读取到在统一浏览器下任意 `Context Group` 下的资源。

`COOP`：跨源开放者政策，对应的 `HTTP Header` 是 `Cross-Origin-Opener-Policy`。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/034bb98bb766434c8c7df9edae6ef2b7~tplv-k3u1fbpfcp-zoom-1.image)

通过将 `COOP` 设置为 `Cross-Origin-Opener-Policy: same-origin`，可以把从该网站打开的其他不同源的窗口隔离在不同的浏览器 `Context Group`，这样就创建的资源的隔离环境。


详细的可以看我这篇文章：[新的跨域策略：使用COOP、COEP为浏览器创建更安全的环境](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490474&idx=1&sn=4be6c15b9077fbcadefd2888ce8885fb&source=41#wechat_redirect)

### 跨源嵌入程序政策（COEP）

`COEP`：跨源嵌入程序政策，对应的 `HTTP Header` 是 `Cross-Origin-Embedder-Policy`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73099fb34b274dbc84696ca9ee4c415e~tplv-k3u1fbpfcp-zoom-1.image)

启用 `Cross-Origin-Embedder-Policy: require-corp`，你可以让你的站点仅加载明确标记为可共享的跨域资源，或者是同域资源。


详细的也不多介绍了，其实都在这篇文章里讲过了：[新的跨域策略：使用COOP、COEP为浏览器创建更安全的环境](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490474&idx=1&sn=4be6c15b9077fbcadefd2888ce8885fb&source=41#wechat_redirect)


### 跨域读取阻止（CORB）

即使所有不同源的页面都处于自己单独的进程中，页面仍然可以合法的请求一些跨站的资源，例如图片和 `JavaScript` 脚本，有些恶意网页可能通过 `<img>` 元素来加载包含敏感数据的 `JSON` 文件。

如果没有 `站点隔离` ，则 `JSON` 文件的内容会保存到渲染器进程的内存中，此时，渲染器会注意到它不是有效的图像格式，并且不会渲染图像。但是，攻击者随后可以利用 `Spectre` 之类的漏洞来潜在地读取该内存块。

跨域读取阻止（`CORB`）可以根据其 `MIME` 类型防止 `balance` 内容进入渲染器进程内存中。

详细的原理，可以看这篇文章：[跨域，不止CORS](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490585&idx=1&sn=50f95cbe025007a0a8d47b4a5afe9b98&chksm=c2e2e932f5956024a2613ea9d21281539ea9a39b22ce2765e92c4c4cb359575bbc1cf3a3c6be&token=260804687&lang=zh_CN#rd)



## 参考

- https://www.bilibili.com/video/av18144159/
- https://zhuanlan.zhihu.com/p/32784852

## 最后


浏览器做了这么多的策略，其实只能说可以在一定程度上缓解这个漏洞，实际上并不能从根源上消除，因为本质上 `Spectre` 还是一个硬件层面上的漏洞、提升漏洞的攻击成本。

这个漏洞本身也很难解，无论是预测执行还是缓存，做了限制就代表性能会大大降低，所以硬件层面上也一直没有解决这个问题。

怎么样，这篇文章之后应该对 `Spectre` 清晰不少了吧，另外前面的几篇文章应该也更清晰了。后续浏览器可能还会出更多的策略或者推荐配置，大家可以持续关注～

如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
