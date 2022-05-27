---
title: 前端领域的 “干净架构”
category: 翻译
tag: 前端架构
date: 2022-01-19
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

前端有架构吗？这可能是很多人心里的疑惑，因为在实际业务开发里我们很少为前端去设计标准规范的代码架构，可能更多的去关注的是工程化、目录层级、以及业务代码的实现。

今天我们来看一种前端架构的模式，原作者称它为“干净架构（`Clean Architecture`）”，文章很长，讲的也很详细，我花了很长时间去读完了它，看完很有收获，翻译给大家，文中也融入了很多我自己的思考，推荐大家看完。

- 英文原文：https://dev.to/bespoyasov/clean-architecture-on-frontend-4311
- 本文中示例的源码：https://github.com/bespoyasov/frontend-clean-architecture/

首先，我们会简单介绍一下什么是干净架构（`Clean architecture`），比如领域、用例和应用层这些概念。然后就是怎么把干净架构应用于前端，以及值不值得这么做。

接下来，我们会用干净架构的原则来设计一个商店应用，并从头实现一下，看看它能不能运行起来。

这个应用将使用 `React` 作为它的 UI 框架，这只是为了表明这种开发方式是可以和 `React` 一起使用的。你也可以选择其他任何一种 UI 库去实现它。

代码中会用到一些 `TypeScript`，这只是为了展示怎么使用类型和接口来描述实体。其实所有的代码都可以不用 `TypeScript` 实现，只是代码不会看起来那么富有表现力。


## 架构和设计

> 设计本质上就是以一种可以将它们重新组合在一起的方式将事物拆开…… 将事物拆分成可以重新组合的事物，这就是设计。 — Rich Hickey《设计、重构和性能》

系统设计其实就是系统的拆分，最重要的是我们可以在不耗费太多时间的情况下重新把它们组起来。

我同意上面这个观点，但我认为系统架构的另一个主要目标是系统的可扩展性。我们应用的需求是不断变化的。我们希望我们的程序可以非常易于更新和修改以满足持续变化的新需求。干净的架构就可以帮助我们实现这一目标。

## 什么是干净的架构？

干净架构是一种根据应用程序的领域（`domain`）的相似程度来拆分职责和功能的方法。

领域（`domain`）是由真实世界抽象而来的程序模型。可以反映现实世界和程序中数据的映射。比如，如果我们更新了一个产品的名称，用新名称来替换旧名称就是领域转换。


干净架构的功能通常被分为三层，我们可以看下面这张图：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5fe2d9e107f44668959bce3a593cc7ed~tplv-k3u1fbpfcp-zoom-1.image)

### 领域层

在在中心的是领域层层，这里会描述应用程序主题区域的实体和数据，以及转换该数据的代码。领域是区分不同程序的核心。

你可以把领域理解为当我们从 `React` 迁移到 `Angular`，或者改变某些用例的时候不会变的那一部分。在商店这个应用中，领域就是产品、订单、用户、购物车以及更新这些数据的方法。

数据结构和他们之间的转化与外部世界是相互隔离的。外部的事件调用会触发领域的转换，但是并不会决定他们如何运行。

比如：将商品添加到购物车的功能并不关心商品添加到购物车的方式：

- 用户自己通过点击“购买”按钮添加
- 用户使用了优惠券自动添加。

在这两种情况下，都会返回一个更新之后的购物车对象。


### 应用层

围在领域外面的是应用层，这一层描述了用例。

例如，“添加到购物车”这个场景就是一个用例。它描述了单击按钮后应执行的具体操作，像是一种“协调者”：

- 向服务器发送一个请求；
- 执行领域转换；
- 使用响应的数据更新 UI。

此外，在应用层中还有端口 — 它描述了应用层如何和外部通信。通常一个端口就是一个接口（`interface`），一个行为契约。

端口也可以被认为是一个现实世界和应用程序之间的“缓冲区”。输入端口会告诉我们应用要如何接受外部的输入，同样输出端口会说明如何与外部通信做好准备。


### 适配器层

最外层包含了外部服务的适配器，我们通过适配器来转换外部服务的不兼容 `API`。

适配器可以降低我们的代码和外部第三方服务的耦合，适配器一般分为：

- 驱动型 - 向我们的应用发消息；
- 被动型 - 接受我们的应用所发送的消息。

一般用户最常和驱动型适配器进行交互，例如，处理UI框架发送的点击事件就是一个驱动型适配器。它与浏览器 `API` 一起将事件转换为我们的应用程序可以理解的信号。

驱动型会和我们的基础设施交互。在前端，大部分的基础设施就是后端服务器，但有时我们也可能会直接与其他的一些服务交互，例如搜索引擎。

注意，离中心越远，代码的功能就越 “面向服务”，离应用的领域就越远，这在后面我们要决定一个模块是哪一层的时候是非常重要的。

### 依赖规则

三层架构有一个依赖规则：只有外层可以依赖内层。这意味着：

- 领域必须独立
- 应用层可以依赖领域
- 最外层可以依赖任何东西


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f0a8693672d49f9a423f8feb3c670f1~tplv-k3u1fbpfcp-zoom-1.image)


当然有些特殊的情况可能会违反这个规则，但最好不要滥用它。例如，在领域中也有可能会用到一些第三方库，即使不应该存在这样的依赖关系。下面看代码时会有这样一个例子。

不控制依赖方向的代码可能会变得非常复杂和难以维护。比如：

- 循环依赖，模块 A 依赖于 B，B 依赖于 C，C 依赖于 A。
- 可测试性差，即使测试一小块功能也不得不模拟整个系统。
- 耦合度太高，因此模块之间的交互会很脆弱。

## 干净架构的优势


### 独立领域

所有应用的核心功能都被拆分并统一维护在一个地方—领域

领域中的功能是独立的，这意味着它更容易测试。模块的依赖越少，测试所需的基础设施就越少。

独立的领域也更容易根据业务的期望进行测试。这有助于让新手理解起来更容易。此外，独立的域也让从需求到代码实现中出现的错误更容易排除。

### 独立用例

应用的使用场景和用例都是独立描述的。它决定了我们所需要哪些第三方服务。我们让外部服务更适应我们的需求，这让我们有更多的空间可以选择合适的第三方服务。比如，现在我们调用的支付系统涨价了，我们可以很快的换掉它。

用例的代码也是扁平的，并且容易测试，扩展性强。我们会在后面的示例中看到这一点。


### 可替换的第三方服务

适配器让外部第三方服务更容易替换。只要我们不改接口，那么实现这个接口的是哪个第三方服务都没关系。

这样如果其他人改动了代码，不会直接影响我们。适配器也会减少应用运行时错误的传播。

## 实现干净架构的成本

架构首先是一种工具。像任何其他工具一样，干净的架构除了好处之外还会带来额外的成本。

### 需要更多时间

首先是时间，设计、实现都需要更多的时间，因为直接调用第三方服务总是比写适配器简单。

我们很难在一开始就把模块所有的交互和需求都想的很明白，我们设计的时候需要时刻留意哪些地方可能发生变化，所以要考虑更多的可扩展性。

### 有时会显得多余

一般来说，干净架构并不适用于所有场景、甚至有的时候是有害的。如果本身就是一个很小的项目，你还要按照干净架构进行设计，这会大大增加上手门槛。


### 上手更困难

完全按照干净架构进行设计和实现会让新手上手更加困难，因为他首先要了解清楚应用是怎么运行起来的。


### 代码量增加

这是前端会特有的一个问题，干净架构会增加最终打包的产物体积。产物越大，浏览器下载和解释的时间越长，所以代码量一定要把控好，适当删减代码：

- 将用例描述的得更简单一些；
- 直接从适配器和领域交互，绕过用例；
- 进行代码拆分


## 如何降低这些成本

你可以通过适当的偷工减料和牺牲架构的“干净度”来减少一些实现时间和代码量。如果舍弃一些东西会获得更大的收益，我会毫不犹豫的去做。

所以，不必在所有方面走遵守干净架构的设计准则，把核心准则遵守好即可。

### 抽象领域

对领域的抽象可以帮助我们理解整体的设计，以及它们是怎么工作的，同时也会让其他开发人员更容易理解程序、实体以及它们之间的关系。

即使我们直接跳过其他层，抽象的领域也更加容易重构。因为它们的代码是集中封装在一个地方的，其他层需要的时候可以方便添加。

### 遵守依赖规则

第二条不应该放弃的规则是依赖规则，或者说是它们的依赖方向。外部的服务需要适配内部，而不是反方向的。

如果你尝试直接去调用一个外部 API，这就是有问题的，最好在还没出问题之前写个适配器。

## 商店应用的设计

说完了理论，我们就可以开始实践了，下面我们来实际设计一个商店应用的。

商店会出售不同种类的饼干，用户可以自己选择要购买的饼干，并通过三方支付服务进行付款。

用户可以在首页看到所有饼干，但是只有登录后才能购买，点击登录按钮可以跳转到登录页。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f31b8d4aa4ab490bbd7ff4e7206284be~tplv-k3u1fbpfcp-zoom-1.image)

登录成功后，用户就可以把饼干加进购物车了。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d6b831ed3c443b3846f961d18eca605~tplv-k3u1fbpfcp-zoom-1.image)

把饼干加进购物车后，用户就可以付款了。付款后，购物车会清空，并产生一个新的订单。

首先，我们来对实体、用例和功能进行定义，并对它们进行分层。

### 设计领域

程序设计中最重要的就是领域设计，它们表示了实体到数据的转换。

商店的领域可能包括：

- 每个实体的数据类型：用户、饼干、购物车和订单；
- 如果你是用OOP（面向对象思想）实现的，那么也要设计生成实体的工厂和类；
- 数据转换的函数。

领域中的转换方法应该只依赖于领域的规则，而不依赖于其他任何东西。比如方法应该是这样的：

- 计算总价的方法
- 检测用户口味的方法
- 检测商品是否在购物车的方法


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/55c62d74c22e4a57ac225d339b32d520~tplv-k3u1fbpfcp-zoom-1.image)


### 设计应用层

应用层包含用例，一个用包含一个参与者、一个动作和一个结果。

在商店应用里，我们可以这样区分：

- 一个产品购买场景；
- 支付，调用第三方支付系统；
- 与产品和订单的交互：更新、查询；
- 根据角色访问不同页面。

我们一般都是用主题领域来描述用例，比如“购买”包括下面的步骤:

- 从购物车中查询商品并创建新订单；
- 创建支付订单；
- 支付失败时通知用户；
- 支付成功，清空购物车，显示订单。

用例方法就是描述这个场景的代码。

此外，在应用层中还有端口—用于与外界通信的接口。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f68475a185fc405f801cb2520ae1b16c~tplv-k3u1fbpfcp-zoom-1.image)


### 设计适配器层

在适配器层，我们为外部服务声明适配器。适配器可以为我们的系统兼容各种不兼容的外部服务。

在前端，适配器一般是UI框架和对后端的API请求模块。比如在我们的商店程序中会用到：

- 用户界面；
- API请求模块；
- 本地存储的适配器；
- API返回到应用层的适配器。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b1aab26be7dc40d3a2d6e3043f05f28c~tplv-k3u1fbpfcp-zoom-1.image)

### 对比 MVC 架构

有时我们很难判断某些数据属于哪一层，这里可以和 MVC 架构做个小对比：

- Model 一般都是领域实体
- Controller 一般是与转换或者应用层
- View 是驱动适配器

这些概念虽然在细节上不太相同，但是非常相似。

## 实现细节—领域

一旦我们确定了我们需要哪些实体，我们就可以开始定义它们的行为了，下面就是我们项目的目录结构：

```
src/
|_domain/
  |_user.ts
  |_product.ts
  |_order.ts
  |_cart.ts
|_application/
  |_addToCart.ts
  |_authenticate.ts
  |_orderProducts.ts
  |_ports.ts
|_services/
  |_authAdapter.ts
  |_notificationAdapter.ts
  |_paymentAdapter.ts
  |_storageAdapter.ts
  |_api.ts
  |_store.tsx
|_lib/
|_ui/
```

领域都定义在 `domain` 目录下，应用层定义在 `application` 目录下，适配器都定义在 `service` 目录下。最后我们还会讨论目录结构是否会有其他的替代方案。

### 创建领域实体

我们在领域中有 4 个实体：

- product（产品）
- user（用户）
- order（订单）
- cart（购物车）

其中最重要的就是 `user`，在回话中，我们会把用户信息存起来，所以我们单独在领域中设计一个用户类型，用户类型包括以下数据：

```ts
// domain/user.ts

export type UserName = string;
export type User = {
  id: UniqueId;
  name: UserName;
  email: Email;
  preferences: Ingredient[];
  allergies: Ingredient[];
};
```

用户可以把饼干放进购物车，我们也给购物车和饼干加上类型。

```ts
// domain/product.ts

export type ProductTitle = string;
export type Product = {
  id: UniqueId;
  title: ProductTitle;
  price: PriceCents;
  toppings: Ingredient[];
};


// domain/cart.ts

import { Product } from "./product";

export type Cart = {
  products: Product[];
};
```
付款成功后，将创建一个新订单，我们再来添加一个订单实体类型。

```ts
// domain/order.ts  — ConardLi

export type OrderStatus = "new" | "delivery" | "completed";

export type Order = {
  user: UniqueId;
  cart: Cart;
  created: DateTimeString;
  status: OrderStatus;
  total: PriceCents;
};
```

### 理解实体之间的关系

以这种方式设计实体类型的好处是我们可以检查它们的关系图是否和符合实际情况：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf7e1d49c1494a01b654c4af37ad24a3~tplv-k3u1fbpfcp-zoom-1.image)

我们可以检查以下几点：

- 参与者是否是一个用户
- 订单里是否有足够的信息
- 有些实体是否需要扩展
- 在未来是否有足够的可扩展性

此外，在这个阶段，类型可以帮助识别实体之间的兼容性和调用方向的错误。

如果一切都符合我们预期的，我们就可以开始设计领域转换了。


### 创建数据转换

我们刚刚设计的这些类型数据会发生各种各样的事情。我们可以添加商品到购物车、清空购物车、更新商品和用户名等。下面我们分别来为这些数据转换创建对应的函数：

比如，为了判断某个用户是喜欢还是厌恶某个口味，我们可以创建两个函数：

```ts
// domain/user.ts

export function hasAllergy(user: User, ingredient: Ingredient): boolean {
  return user.allergies.includes(ingredient);
}

export function hasPreference(user: User, ingredient: Ingredient): boolean {
  return user.preferences.includes(ingredient);
}
```
将商品添加到购物车并检查商品是否在购物车中：

```ts
// domain/cart.ts  — ConardLi

export function addProduct(cart: Cart, product: Product): Cart {
  return { ...cart, products: [...cart.products, product] };
}

export function contains(cart: Cart, product: Product): boolean {
  return cart.products.some(({ id }) => id === product.id);
}
```

下面是计算总价（如果需要的话我们还可以设计更多的功能，比如配打折、优惠券等场景）：

```ts
// domain/product.ts

export function totalPrice(products: Product[]): PriceCents {
  return products.reduce((total, { price }) => total + price, 0);
}
```

创建新订单，并和对应用户以及他的购物车建立关联。

```ts
// domain/order.ts

export function createOrder(user: User, cart: Cart): Order {
  return {
    user: user.id,
    cart,
    created: new Date().toISOString(),
    status: "new",
    total: totalPrice(products),
  };
}
```

## 详细设计—共享内核

你可能已经注意到我们在描述领域类型的时候使用的一些类型。例如 `Email`，`UniqueId` 或 `DateTimeString` 。这些其实都是类型别名：

```ts
// shared-kernel.d.ts

type Email = string;
type UniqueId = string;
type DateTimeString = string;
type PriceCents = number;
```

我用 `DateTimeString` 代替 `string` 来更清晰的表明这个字符串是用来做什么的。这些类型越贴近实际，就更容易排查问题。

这些类型都定义在 `shared-kernel.d.ts` 文件里。共享内核指的是一些代码和数据，对他们的依赖不会增加模块之间的耦合度。

在实践中，共享内核可以这样解释：我们用到 `TypeScript`，使用它的标准类型库，但我们不会把它们看作是一个依赖项。这是因为使用它们的模块互相不会产生影响并且可以保持解耦。

并不是所有代码都可以被看作是共享内核，最主要的原则是这样的代码必须和系统处处都是兼容的。如果程序的一部分是用 `TypeScript` 编写的，而另一部分是用另一种语言编写的，共享核心只可以包含两种语言都可以工作的部分。

在我们的例子中，整个应用程序都是用 `TypeScript` 编写的，所以内置类型的别名完全可以当做共享内核的一部分。这种全局都可用的类型不会增加模块之间的耦合，并且在程序的任何部分都可以使用到。

## 实现细节—应用层

我们已经完成了领域的设计，下面可以设计应用层了。

这一层会包含具体的用例设计，比如一个用例是将商品添加到购物车并支付的完整过程。

用例会涉及应用和外部服务的交互，与外部服务的交互都是副作用。我们都知道调用或者调试没有副作用的方法会更简单一些，所以大部分领域函数都实现为成纯函数了。

为了将无副作用的纯函数和与有副作用的交互结合起来，我们可以将应用层用作有副作用的非纯上下文。

### 非纯上下文纯数据转换

一个包含副作用的非纯上下文和纯数据转换是这样一种代码组织方式：

- 首先执行一个副作用来获取一些数据；
- 然后对数据执行纯函数进行数据处理；
- 最后再执行一个副作用，存储或传递这个结果。

比如，“将商品放入购物车”这个用例：

- 首先，从数据库里获取购物车的状态；
- 然后调用购物车更新函数，把要添加的商品信息传进去；
- 最后将更新的购物车保存到数据库中。

这个过程就像一个“三明治”：副作用、纯函数、副作用。所有主要的逻辑处理都在调用纯函数进行数据转换上，所有与外部的通信都隔离在一个命令式的外壳中。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/868c8440118a43afb5ee09abb801f820~tplv-k3u1fbpfcp-zoom-1.image)


### 设计用例

我们选择结账这个场景来做用例设计，它更具代表性，因为它是异步的，而且会与很多第三方服务进行交互。

我们可以想一想，通过整个用例我们要表达什么。用户的购物车里有一些饼干，当用户点击购买按钮的时候：

- 要创建一个新订单；
- 在第三方支付系统中支付；
- 如果支付失败，通知用户；
- 如果支付成功，将订单保存在服务器上；
- 在本地存储保存订单数据，并在页面上显示；

设计函数的时候，我们会把用户和购物车都作为参数，然后让这个方法完成整个过程。

```ts
type OrderProducts = (user: User, cart: Cart) => Promise<void>;
```

当然，理想情况下，用例不应该接收两个单独的参数，而是接收一个封装后的对象，为了精简代码，我们先这样处理。

### 编写应用层的接口

我们再来仔细看看用例的步骤：订单创建本身就是一个领域函数，其他一切操作我们都要调用外部服务。

我们要牢记，外部方法永远要适配我们的需求。所以，在应用层，我们不仅要描述用例本身，也要定义调用外部服务的通信方式—端口。

想一想我们可能会用到的服务：

- 第三方支付服务；
- 通知用户事件和错误的服务；
- 将数据保存到本地存储的服务。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e8610ebd63ed4a3ab3b19fcff9e7e25b~tplv-k3u1fbpfcp-zoom-1.image)

注意，我们现在讨论的是这些服务的 `interface` ，而不是它们的具体实现。在这个阶段，描述必要的行为对我们来说很重要，因为这是我们在描述场景时在应用层所依赖的行为。

如何实现现在不是重点，我们可以在最后再考虑调用哪些外部服务，这样代码才能尽量保证低耦合。

另外还要注意，我们按功能拆分接口。与支付相关的一切都在同一个模块中，与存储相关的都在另一个模块中。这样更容易确保不的同第三方服务的功能不会混在一起。

### 支付系统接口

我们这个商店应用只是个小 `Demo`，所以支付系统会很简单。它会有一个 `tryPay` 方法，这个方法将接受需要支付的金额，然后返回一个布尔值来表明支付的结果。

```ts
// application/ports.ts  — ConardLi

export interface PaymentService {
  tryPay(amount: PriceCents): Promise<boolean>;
}
```

一般来说，付款的处理是在服务端。但我们只是简单演示一下，所以在前端就直接处理了。后面我们也会调用一些简单的API，而不是直接和支付系统进行通信。


### 通知服务接口

如果出现一些问题，我们必须通知到用户。

我们可以用各种不同的方式通知用户。比如使用 UI，发送邮件，甚至可以让用户的手机振动。

一般来说，通知服务最好也抽象出来，这样我们现在就不用考虑实现了。

给用户发送一条通知：

```js
// application/ports.ts

export interface NotificationService {
  notify(message: string): void;
}
```


### 本地存储接口

我们会将新的订单保存在本地的存储库中。

这个存储可以是任何东西：Redux、MobX、任何存储都可以。存储库可以在不同实体上进行拆分，也可以是整个应用程序的数据都维护在一起。不过现在都不重要，因为这些都是实现细节。

我习惯的做法是为每个实体都创建一个单独的存储接口：一个单独的接口存储用户数据，一个存储购物车，一个存储订单：

```ts
// application/ports.ts    — ConardLi

export interface OrdersStorageService {
  orders: Order[];
  updateOrders(orders: Order[]): void;
}
```


### 用例方法

下面我们来看看能不能用现有的领域方法和刚刚建的接口来构建一个用例。脚本将包含如下步骤：

- 验证数据；
- 创建订单；
- 支付订单；
- 通知问题；
- 保存结果。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0806daf010024d099fa333a1aee5a81e~tplv-k3u1fbpfcp-zoom-1.image)

首先，我们声明出来我们要调用的服务的模块。 `TypeScript` 会提示我们没有给出接口的实现，先不要管他。

```js
// application/orderProducts.ts — ConardLi

const payment: PaymentService = {};
const notifier: NotificationService = {};
const orderStorage: OrdersStorageService = {};
```

现在我们可以像使用真正的服务一样使用这些模块。我们可以访问他们的字段，调用他们的方法。这在把用例转换为代码的时候非常有用。

现在，我们创建一个名为 `orderProducts` 的方法来创建一个订单：

```ts
// application/orderProducts.ts  — ConardLi
//...

async function orderProducts(user: User, cart: Cart) {
  const order = createOrder(user, cart);
}
```

这里，我们把接口当作是行为的约定。也就是说以模块示例会真正执行我们期望的操作：

```ts
// application/orderProducts.ts  — ConardLi
//...

async function orderProducts(user: User, cart: Cart) {
  const order = createOrder(user, cart);

  // Try to pay for the order;
  // Notify the user if something is wrong:
  const paid = await payment.tryPay(order.total);
  if (!paid) return notifier.notify("Oops! 🤷");

  // Save the result and clear the cart:
  const { orders } = orderStorage;
  orderStorage.updateOrders([...orders, order]);
  cartStorage.emptyCart();
}
```

注意，用例不会直接调用第三方服务。它依赖于接口中描述的行为，所以只要接口保持不变，我们就不需要关心哪个模块来实现它以及如何实现它，这样的模块就是可替换的。


## 实现细节—适配器层

我们已经把用例“翻译”成 `TypeScript` 了，现在我们来检查一下现实是否符合我们的需求。

通常情况下是不会的，所以我们要通过封装适配器来调用第三方服务。


### 添加UI和用例

首先，第一个适配器就是一个 UI 框架。它把浏览器的 API 与我们的应用程序连接起来。在订单创建的这个场景，就是“结帐”按钮和点击事件的处理方法，这里会调用具体用例的功能。

```js
// ui/components/Buy.tsx  — ConardLi

export function Buy() {
  // Get access to the use case in the component:
  const { orderProducts } = useOrderProducts();

  async function handleSubmit(e: React.FormEvent) {
    setLoading(true);
    e.preventDefault();

    // Call the use case function:
    await orderProducts(user!, cart);
    setLoading(false);
  }

  return (
    <section>
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>{/* ... */}</form>
    </section>
  );
}
```

我们可以通过一个 `Hook` 来封装用例，建议把所有的服务都封装到里面，最后返回用例的方法：

```ts
// application/orderProducts.ts  — ConardLi

export function useOrderProducts() {
  const notifier = useNotifier();
  const payment = usePayment();
  const orderStorage = useOrdersStorage();

  async function orderProducts(user: User, cookies: Cookie[]) {
    // …
  }

  return { orderProducts };
}
```

我们使用 `hook` 来作为一个依赖注入。首先我们使用 `useNotifier，usePayment，useOrdersStorage` 这几个 `hook` 来获取服务的实例，然后我们用函数 `useOrderProducts` 创建一个闭包，让他们可以在 `orderProducts` 函数中被调用。

另外需要注意的是，用例函数和其他的代码是分离的，这样对测试更加友好。

### 支付服务实现

用例使用 `PaymentService` 接口，我们先来实现一下。

对于付款操作，我们依然使用一个假的 API 。同样的，我们现在还是没必要编写全部的服务，我们可以之后再实现，现在最重要的是实现指定的行为：

```ts
// services/paymentAdapter.ts  — ConardLi

import { fakeApi } from "./api";
import { PaymentService } from "../application/ports";

export function usePayment(): PaymentService {
  return {
    tryPay(amount: PriceCents) {
      return fakeApi(true);
    },
  };
}
```

`fakeApi` 这个函数会在 `450` 毫秒后触发的超时，模拟来自服务器的延迟响应，它返回我们传入的参数。

```ts
// services/api.ts  — ConardLi

export function fakeApi<TResponse>(response: TResponse): Promise<TResponse> {
  return new Promise((res) => setTimeout(() => res(response), 450));
}
```


### 通知服务实现

我们就简单使用 `alert` 来实现通知，因为代码是解耦的，以后再来重写这个服务也不成问题。

```ts
// services/notificationAdapter.ts  — ConardLi

import { NotificationService } from "../application/ports";

export function useNotifier(): NotificationService {
  return {
    notify: (message: string) => window.alert(message),
  };
}
```


### 本地存储实现

我们就通过 `React.Context` 和 `Hooks` 来实现本地存储。

我们创建一个新的 `context`，然后把它传给 `provider`，然后导出让其他的模块可以通过 `Hooks` 使用。


```jsx
// store.tsx  — ConardLi

const StoreContext = React.createContext<any>({});
export const useStore = () => useContext(StoreContext);

export const Provider: React.FC = ({ children }) => {
  // ...Other entities...
  const [orders, setOrders] = useState([]);

  const value = {
    // ...
    orders,
    updateOrders: setOrders,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};
```

我们可以给每一个功能点都实现一个 `Hook` 。这样我们就不会破坏服务接口和存储，至少在接口的角度来说他们是分离的。

```tsx
// services/storageAdapter.ts

export function useOrdersStorage(): OrdersStorageService {
  return useStore();
}
```

此外，这种方法还可以使我们能够为每个商店定制额外的优化：创建选择器、缓存等。

## 验证数据流程图

现在让我们验证一下用户是怎么和应用程序通信的。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f481dbfdbebc47988f10fd90f9676772~tplv-k3u1fbpfcp-zoom-1.image)

用户与 UI 层交互，但是 UI 只能通过端口访问服务接口。也就是说，我们可以随时替换 UI。

用例是在应用层处理的，它可以准确地告诉我们需要哪些外部服务。所有主要的逻辑和数据都封装在领域中。

所有外部服务都隐藏在基础设施中，并且遵守我们的规范。如果我们需要更改发送消息的服务，只需要修改发送消息服务的适配器。

这样的方案让代码更方便替换、更容易测试、扩展性更强，以适应不断变化的需求。

## 有什么可以改进的

上面介绍的这些已经可以让你开始并初步了解干净的架构了，但是我想指出上面我为了让示例更简单做的一些偷工减料的事情。

读完下面的内容，大家可以理解 “没有偷工减料”的干净架构是什么样子的。

### 使用对象而不是数字来表示价格

你可能已经注意到我用一个数字来描述价格，这不是一个好习惯。

```ts
// shared-kernel.d.ts

type PriceCents = number;
```

数字只能表示数量，不能表示货币，没有货币的价格是没有意义的。理想情况下，价格应该是具有两个字段的对象：价值和货币。

```ts
type Currency = "RUB" | "USD" | "EUR" | "SEK";
type AmountCents = number;

type Price = {
  value: AmountCents;
  currency: Currency;
};
```

这样就能解决存储货币的问题了，并可以省去大量的存储和处理货币的精力。在示例中我没有这么做是为了让这个例子尽量简单。在真实的情况里，价格的结构定义会更加接近上面的写法。

另外，值得一提的是价格的单位，比如美元的最小单位是美分。以这种方式显示价格让我可以避免考虑浮点数计算的问题。


### 按功能拆分代码，而不是按层

代码可以 “按功能” 拆分到文件夹中，而不是“按层”，一块功能就是下面饼图的一部分。

这种结构更清晰，因为它可以让你分别部署不同的功能点：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2f4cfdab0cd43b39f7725e36d3e4e76~tplv-k3u1fbpfcp-zoom-1.image)

### 注意跨组件使用

如果我们正在讨论将系统拆分为组件，就不得不考虑跨组件代码使用的问题。我们再来看看创建订单的代码：

```ts
import { Product, totalPrice } from "./product";

export function createOrder(user: User, cart: Cart): Order {
  return {
    user: user.id,
    cart,
    created: new Date().toISOString(),
    status: "new",
    total: totalPrice(products),
  };
}
```

这个函数用到了从另一个 `Product` 模块引入的 `totalPrice` 方法。这样使用本身没有什么问题，但是如果我们要考虑把代码拆分到独立的功能的时候，我们不能直接访问其他模块的代码。

### 使用 ts-brand ，而不是类型别名

在共享内核的编写中，我使用了类型别名。它们很容易实现，但缺点是 `TypeScript` 没有监控并强制执行它们的机制。

这看起来也不是个问题：你是用 `string` 类型去替代 `DateTimeString` 也不会怎么样，代码还是会编译成功。但是，这样会让代码变得脆弱、可读性也很差，因为这样你可以用任意的字符串，导致错误的可能性会增加。

有一种方法可以让 `TypeScript` 理解我们想要一个特定的类型 — `ts-brand`（`https://github.com/kourge/ts-brand`）。它可以准确的跟踪类型的使用方式，但会使代码更复杂一些。


### 注意领域中可能的依赖

接下来的问题是我们在 `createOrder` 函数的领域中创建了一个日期：

```ts
import { Product, totalPrice } from "./product";

export function createOrder(user: User, cart: Cart): Order {
  return {
    user: user.id,
    cart,

    // Вот эта строка:
    created: new Date().toISOString(),

    status: "new",
    total: totalPrice(products),
  };
}
```

`new Date().toISOString()` 这样的函数可能会被重复调用很多次，我们可以把它封装到一个 `hleper` 里面：

```ts
// lib/datetime.ts  — ConardLi

export function currentDatetime(): DateTimeString {
  return new Date().toISOString();
}
```

然后在领域中调用它：

```ts
// domain/order.ts

import { currentDatetime } from "../lib/datetime";
import { Product, totalPrice } from "./product";

export function createOrder(user: User, cart: Cart): Order {
  return {
    user: user.id,
    cart,
    created: currentDatetime(),
    status: "new",
    total: totalPrice(products),
  };
}
```

但是领域的原则是不能依赖其他任何东西，所以 `createOrder` 函数最好是所有数据都从外面传进来，日期可以作为最后一个参数：

```ts
// domain/order.ts  — ConardLi

export function createOrder(
  user: User,
  cart: Cart,
  created: DateTimeString
): Order {
  return {
    user: user.id,
    products,
    created,
    status: "new",
    total: totalPrice(products),
  };
}
```
这样我们就不会破坏依赖规则，即使创建日期也需要依赖第三方库：

```ts
function someUserCase() {
  // Use the `dateTimeSource` adapter,
  // to get the current date in the desired format:
  const createdOn = dateTimeSource.currentDatetime();

  // Pass already created date to the domain function:
  createOrder(user, cart, createdOn);
}
```

这会让领域保持独立，也使测试更容易。

在前面的示例中，我不这样做有两个原因：它会分散我们的重点，如果它只使用语言本身的特性，我认为依赖你自己的 `Helper` 没有任何问题。这样的 `Helper` 甚至可以被视为共享内核，因为它们只会减少代码的重复度。

### 注意购物车与订单的关系

在这个小例子中，`Order` 会包含 `Cart`, 因为购物车只表示 `Product` 列表：

```ts
export type Cart = {
  products: Product[];
};

export type Order = {
  user: UniqueId;
  cart: Cart;
  created: DateTimeString;
  status: OrderStatus;
  total: PriceCents;
};
```
如果购物车有其他的和订单没有关联的属性，可能会出问题，所以直接用 `ProductList` 会更合理：

```ts
type ProductList = Product[];

type Cart = {
  products: ProductList;
};

type Order = {
  user: UniqueId;
  products: ProductList;
  created: DateTimeString;
  status: OrderStatus;
  total: PriceCents;
};
```

### 让用例更方便测试

用例也有很多要讨论的地方。比如，`orderProducts` 函数很难独立于 `React` 来测试，这不太好。理想情况下，测试不应该消耗太多的成本。

问题的根本原因我们使用 `Hooks` 来实现了用例：

```ts
// application/orderProducts.ts  — ConardLi

export function useOrderProducts() {
  const notifier = useNotifier();
  const payment = usePayment();
  const orderStorage = useOrdersStorage();
  const cartStorage = useCartStorage();

  async function orderProducts(user: User, cart: Cart) {
    const order = createOrder(user, cart);

    const paid = await payment.tryPay(order.total);
    if (!paid) return notifier.notify("Oops! 🤷");

    const { orders } = orderStorage;
    orderStorage.updateOrders([...orders, order]);
    cartStorage.emptyCart();
  }

  return { orderProducts };
}
```

在规范的实现中，用例方法可以放在 `Hooks` 的外面，服务通过参数或者使用依赖注入传入用例：

```ts
type Dependencies = {
  notifier?: NotificationService;
  payment?: PaymentService;
  orderStorage?: OrderStorageService;
};

async function orderProducts(
  user: User,
  cart: Cart,
  dependencies: Dependencies = defaultDependencies
) {
  const { notifier, payment, orderStorage } = dependencies;

  // ...
}
```

然后 `Hooks` 的代码就可以当做一个适配器，只有用例会留在应用层。`orderProdeucts` 方法很容易就可以被测试了。


```ts
function useOrderProducts() {
  const notifier = useNotifier();
  const payment = usePayment();
  const orderStorage = useOrdersStorage();

  return (user: User, cart: Cart) =>
    orderProducts(user, cart, {
      notifier,
      payment,
      orderStorage,
    });
}
```

### 配置自动依赖注入

在应用层，我们是手动将依赖注入服务的：

```ts
export function useOrderProducts() {
  // Here we use hooks to get the instances of each service,
  // which will be used inside the orderProducts use case:
  const notifier = useNotifier();
  const payment = usePayment();
  const orderStorage = useOrdersStorage();
  const cartStorage = useCartStorage();

  async function orderProducts(user: User, cart: Cart) {
    // ...Inside the use case we use those services.
  }

  return { orderProducts };
}
```

当然还有更好的做法，依赖注入可以自动完成。我们前面已经通过最后一个参数实现了最简单的注入版本，下面可以进一步配置自动依赖注入。

在这个特定的应用程序中，我认为设置依赖注入没有多大意义。它会分散我们的注意力并使代码过于复杂。在使用了 `React` 和 `hooks` 的情况下，我们可以将它们用作“容器”，返回指定接口的实现。是的，虽然还是手动实现的，但它不会增加上手门槛，并且对于新手开发人员来说阅读速度更快。

## 实际项目中的情况可能更复杂

文章中的示例是经过精简的而且需求也比较简单。很明显，我们实际开发中比这个例子要复杂的多。所以我还想谈谈实际开发中使用干净架构时可能出现的常见问题。


### 分支业务逻辑

最重要的问题是我们对需求的实际场景研究不够深入。想象一下，一家商店有一个产品、一个打折产品和一种已经注销的产品。我们怎么准确描述这些实体？

是不是应该有一个可扩展的“基础”实体呢？这个实体究竟应该怎么扩展？应该有额外的字段吗？这些实体是否应该互斥？

可能有太多的问题和太多的答案，如果只是假设，我们不可能考虑到所有的情况。

具体解决方法还要视具体情况而定，我只能推荐几个我的经验。

不建议使用继承，即使它看起来可“扩展”。

复制粘贴的代码并不一定都不好，有时候甚至能发挥更大的作用。创建两个几乎相同的实体，观察它们在现实中的行为。在某些时候，它们的行为可能区别很大，有时候也可能只有一两个字段的区别。合并两个非常相似的实体比写大量的的检查要容易很多。

如果你一定要扩展一些内容的话。。

记住协变、逆变和不变，这样你就不会多出一些意想不到的工作。

在不同的实体和可扩展之间选择，推荐使用类似于 `BEM` 中的块和修饰符概念来帮助你思考，如果我在 `BEM` 的上下文中考虑它，它可以帮助我确定我是否有一个单独的实体或代码的“修饰符扩展”。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/50a2419567d449b9a212889a50f76ee1~tplv-k3u1fbpfcp-zoom-1.image)


> BEM - Block Element Modfier（块元素编辑器）是一个很有用的方法，它可以帮助你创建出可以复用的前端组件和前端代码。




### 相互依赖的用例

第二个问题是用例相关的，通过一个用例的事件触发另一个用例。

我知道并且对我有帮助的处理这个问题的唯一方法是将用例分解为更小的原子用例。它们将更容易组合在一起。

通常，出现这个问题是编程中另外一个大问题的结果。这就是实体组合。



## 最后

在本文里，我们介绍了前端的“干净架构”。

这不是一个黄金标准，而是一个在很多的项目、规范和语言上积累的经验汇总。

我发现它是一种非常方便的方案，可以帮助你解耦你的代码。让层、模块和服务尽量独立。不仅可以独立发布、部署，还可以让你从一个项目迁移另一个项目的时候也更加容易。

你理想下的前端架构是什么样的呢？



如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。


