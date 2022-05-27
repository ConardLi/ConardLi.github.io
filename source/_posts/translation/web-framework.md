---
title: Web 框架究竟解决了什么问题？我们可以脱离它们吗？
category: 翻译
tag:
- 前端架构
- Web
date: 2022-02-23
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。



相信各位在 Web 开发的工作中已经离不开框架了，不知道有多少同学还用原生 JS 写代码呢？你有认真思考过框架究竟为我们解决了什么样的问题吗？脱离了这些框架，我们可以解决这些问题吗？我们来看看今天的文章：



最近，我对将框架与原生的 `JavaScript` 进行对比非常感兴趣。我很想知道这些框架之间的共性和差异是什么，`Web` 平台作为一个精简的替代方案应该提供什么，以及它本身是否可以足够满足我们的需求。

我的目标不是要抨击这些框架，而是想要了解使用框架的成本和收益，确定是否存在某些替代方案，并看看即使我们决定使用框架，是不是可以从中学到一些什么。

首先，我们先深入研究一些跨框架通用的技术特性，以及不同框架如何实现这些特性。



## 框架

我选择了四个框架来研究：当今处于主导地位的框架 `React` ，以及其他三个声称与 `React` 工作方式不同的竞争者。


- `React`：“`React` 以声明式编写 UI，可以让你的代码更加可靠，且方便调试。”
- `SolidJS`：“`SolidJS` 遵循与 `React` 相同的理念…… 但是它有一个完全不同的实现，它放弃了使用虚拟 `DOM`。”
- `Svelte`："`Svelte` 是一种全新的构建用户界面的方法。传统框架如 React 会在浏览器中需要做大量的工作，而 `Svelte` 将这些工作放到构建应用程序的编译阶段来处理。”
- `Lit`：“在 `Web Components` 标准之上构建，额外增加了响应式、声明性模板等能力。”


简单总结一下这些框架的区别：

- `React` 使用声明式视图让构建 UI 变得更容易。
- `SolidJS` 遵循 React 的理念，但使用了不同的技术。
- `Svelte` 对 UI 在编译时做了大量处理。
- `Lit` 使用现有标准，并添加了一些轻量级功能。

## 框架为我们解决什么问题？

### 声明式编程

声明式编程是一种在不指定控制流的情况下定义逻辑的范例。我们描述的是结果需要是什么，而不是我们需要采取什么步骤。

在声明式框架的早期，大约在 `2010` 年，`DOM API` 非常冗长，使用命令式 `JavaScript` 编写 `Web` 应用程序需要大量的样板代码。那时 `“model-view-viewmodel” (MVVM)` 的概念开始流行起来，当时开创性的 `Knockout` 和 `AngularJS` 框架提供了一个 `JavaScript` 声明层来处理库内部的复杂性。

### 数据绑定

数据绑定是一种声明性的方式，它用来表示数据如何在模型和用户界面之间同步。

所有流行的 UI 框架都提供了某种形式的数据绑定，它们的教程基本上都从一个数据绑定示例开始。

下面是 `JSX` 中的数据绑定(`SolidJS` 和 `React`):

```js
function HelloConardLi() {
 const name = "Solid or React;

 return (
     <div>Hello {name}!</div>
 )
}
```

`Lit` 中的数据绑定：

```js
class HelloConardLi extends LitElement {
 @property()
 name = 'lit';

 render() {
   return html`<p>Hello ${this.name}!</p>`;
 }
}
```

`Svelte` 中的数据绑定：

```html
<script>
  let name = 'world';
</script>

<h1>Hello {name}!</h1>
```


### 响应式

响应式是一种表达变化和传递的声明性方式。

当我们有了一种声明式表达数据绑定的方法时，我们需要一种有效的方法让框架传递这个更改。

`React` 引擎会将渲染结果与之前的结果进行比较，并将差异应用到 `DOM` 本身。这种处理变更传播的方法称为虚拟 `DOM`。

在 `SolidJS` 中，这通过它的存储和内置元素更显式地完成。例如，`Show` 元素将跟踪内部发生的变化，而不是虚拟 `DOM`。

在 `Svelte` 中，会生成“响应式”代码。`Svelte` 知道哪些事件会导致更改，并生成简单的代码，在事件和 `DOM` 更改之间划清界限。

在 `Lit` 中，响应式是使用元素属性完成的，本质上依赖于 `HTML` 自定义元素的内置响应性。


### 逻辑

当框架为数据绑定提供一个声明式接口，并实现响应式时，它还需要提供某种方式来表达一些传统上以命定方式编写的逻辑。比如传统的 `“if”` 和 `“for”` 语句，所有主要的框架都提供了这些逻辑的一些表达式。
### 条件

除了绑定数字和字符串等基本数据外，每个框架都提供一个“条件”原语。在 `React` 中，它是这样的：

```js
const [hasError, setHasError] = useState(false);  
return hasError ? <label>出错了！</label> : null;
…
setHasError(true);
```

`SolidJS` 提供了一个内置的条件组件 `Show` ：

```js
<Show when={state.error}>
  <label>出错了!</label>
</Show>
```

`Svelte` 提供了 `#if` 指令：

```js
{#if state.error}
  <label>出错了!</label>
{/if}
```

在 `Lit` 中，你可以在 `render` 函数中使用三元运算：

```js
render() {
 return this.error ? html`<label>出错了!</label>`: null;
}
```


### 列表渲染


还有一个比较常见的就是列表处理，它是 UI 里非常的关键部分，为了有效地工作，它们需要是响应式的，而不是在一个数据项发生变化时更新整个列表。

在 `React` 中，列表处理看起来像这样：

```js
contacts.map((contact, index) =>
 <li key={index}>
   {contact.name}
 </li>)
```

`React` 使用特殊的 `key` 属性来区分列表中的每一项，确保整个列表不会全部重新渲染。

在 `SolidJS` 中，使用 `for` 和 `index` 内置元素：

```html
<For each={state.contacts}>
  {contact => <DIV>{contact.name}</DIV> }
</For>
```

在内部，`SolidJS` 使用它自己的内存与 `for`、`index` 决定状态更改时需要改动哪些元素。它比 `React` 更明确，而且避免了虚拟 `DOM` 的复杂性。

Svelte 使用 `each` 指令：

```js
{#each contacts as contact}
  <div>{contact.name}</div>
{/each}
```

`Lit` 提供了一个 `repeat` 函数，工作方式类似于 `React` 的 `key`

```js
repeat(contacts, contact => contact.id,
    (contact, index) => html`<div>${contact.name}</div>`
```

## 框架带来的成本

上面我们提到，框架提供声名式的数据绑定、条件和列表渲染、以及传递更改的响应式机制，另外还提供组件复用等能力。

这些能力虽然给我们带来了方便，但也额外增加了很多成本。


### 捆绑依赖包的大小

在查看捆绑依赖包的大小时，我习惯查看压缩后非 `Gzip` 的大小。这是与 `JavaScript` 执行的 `CPU` 成本最相关的大小。

- `ReactDOM` 大约 120 KB。
- `SolidJS` 大约 18 KB。
- `Lit` 约为 16 KB。
- `Svelte` 大约 2 KB，但生成的代码大小不同。

似乎最新推出的框架在保持包大小方面都比 `React` 做得更好。虚拟 `DOM` 需要大量的 `JavaScript` 代码。

### 构建

不知从何时开始，我们习惯了“构建”我们的 Web 应用程序。如果不设置 `Node.js` 和 `Webpack` 之类的打包器、处理 `Babel-TypeScript` 启动包中最近的一些配置更改等等，就不可能启动前端项目。

框架的表现力越强，包体积越小，同时构建工具和编译时间的负担就越大。

`Svelte` 声称虚拟 `DOM` 是纯粹的开销。我同意，但 “编译”（如 `Svelte` 和 `SolidJS`）和自定义客户端模板引擎（如 `Lit`）是不是也是一种不同类型的纯开销呢？

### 调试

我们在使用或调试 `Web` 应用程序的时候，看到的代码和我们编写的代码是完全不同的。为了方便调试，我们一般需要依靠一些特殊调试工具来对网站上的代码进行逆向，并将其与我们自己代码中的错误联系起来。

在 `React` 中，调用堆栈永远不是你想象的那样，因为所有的更新都是 `React` 为你处理调度的。在没发生 `bug` 的情况下，这样挺好的。但是，比如你现在要尝试找到一个无限循环重新渲染的 bug，是非常痛苦的。

在 `Svelte` 中，库本身的包体积很小，但你需要发布和调试一大堆额外生成的代码，这些代码是用来实现 `Svelte` 响应式的，它们会据应用的需要进行定制。

使用 `Lit` 的话，它与构建无关，但如果想对它进行调试，你就必须了解它的模板引擎。这可能是我对这个框架持怀疑态度的最大原因。


### 升级

在这篇文章中，我们介绍了4个框架，但还有很多框架 (`AngularJS、Ember.js` 和 `Vue.js` 等) 我们没提到。在这些框架的发展过程中，你能指望它的开发者、它的思想和它的生态系统能持续为你服务吗?

还有一件比修复自己的 `bug` 更麻烦的事，就是你需要持续考虑这些框架的 `bug`。另外你还要考虑是不是在没有修改代码的情况下，升级了一个框架的版本就引入一些新的 `bug`。

确实，这样的问题也存在于浏览器中，但是浏览器一旦有问题，每个人都跑不了。并且浏览器在大多数情况下，修复问题或发布解决方法都是非常迅速的。另外，本文中的大部分模式都基于成熟的 `Web` 平台 `API`，我们也并不是一直都要考虑升级。

## 自己实现一个框架？

在没有框架的情况下进行探索，似乎一个不可避免的结果就是实现一个自己的框架来进行响应式数据绑定。之前我也尝试过，但是看到它的成本有多大后，我决定在这次探索中遵循下面的原则：

不使用框架，也不是自己封装框架，而是想看看能不能直接使用 Web 原生的 API 实现。

## 原生选择

`Web` 平台已经为我们提供了开箱即用的声明式编程机制：`HTML` 和 `CSS`。它们已经非常成熟、而且已经经过了非常广泛的测试。

但是，它们没有提供明确的数据绑定、条件渲染和列表渲染这样的概念，并且也没有跨平台响应式这样微妙的功能。

下面我将尝试整理一些关于如何在不借助框架的情况下，使用原生的 `Web API` 解决这些问题的指南。

### 使用 DOM 树的响应式

我们回到前面提到的错误标签的示例。在 `ReactJS` 和 `SolidJS` 中，我们创建了可以转换为命令式代码的声明式代码，在 `DOM` 中添加或删除这个标签。在 `Svelte` 中，会直接编译生成这样的代码。

但是如果我们根本没有这样的代码，而是直接使用 `CSS` 来隐藏和显示错误标签呢？

```html
<style>
    label.error { display: none; }
    .app.has-error label.error {display: block; }
</style>
<label class="error">出错啦！</label>

<script>
   app.classList.toggle('has-error', true);
</script>

```

在这种情况下，响应是在浏览器中处理的 — 应用程序的类更改会传播到它的后代，直到浏览器中的内部机制决定是否渲染标签。

这样的技术有几个优点：

- 捆绑依赖包的大小为零。
- 没有构建的步骤。
- 在本地浏览器代码中，变更的传播经过了优化和测试，并且避免了例如追加和删除这样不必要的 `DOM` 操作。
- 选择器是稳定的，在这个例子里你可以借助 label 元素的存在，在不借助 `transition groups` 这样的复杂结构的情况下实现动画，而且可以在 `JavaScript` 中保存对它的引用。
- 标签是显示还是隐藏，你可以在开发人员工具的样式面板中很清晰的看到原因。

> 先不说这篇文章的场景，就算你在使用框架的时候，考虑使用 CSS 保持 DOM 稳定和更改状态的想法也是非常不错的。

### 面向表单的“数据绑定”  

在使用大量 `JavaScript` 的单页应用程序(`SPA`)时代之前，表单是创建包含用户输入的 `Web` 应用程序的主要方式。

在以前的多页应用中，用户将填写表单并单击 `“Submit”` 按钮，然后服务端代码会处理响应。

由于表单 `API` 的广泛使用和悠久的历史，它也积累了一些隐藏的优点，使得它们也可以解决那些看起来解决不了的问题。


### 作为稳定选择器的表单和表单元素

表单可以通过名称访问( `document.forms` )，并且每个表单元素也都可以通过名称访问(`form.elements`)。另外，与元素相关联的表单也是可以访问的( `form attribute` )。这不仅包括 `Input` ，还包括其他表单元素，如 `output、textarea` 和 `fieldset`，它们允许嵌套访问树中的元素。

在前面的错误标签示例中，我们展示了如何响应式地显示和隐藏错误消息。下面就是我们在 `React` 中更新错误消息文本的方式（在 `SolidJS` 中也是一样的）：

```js
const [errorMessage, setErrorMessage] = useState(null);
return <label className="error">{errorMessage}</label>
```

当我们拥有稳定的 `DOM` 和稳定的树形表单元素时，我们可以执行下面的操作：

```html
<form name="contactForm">
  <fieldset name="email">
     <output name="error"></output>
  </fieldset>
</form>

<script>
  function setErrorMessage(message) {
  document.forms.contactForm.elements.email.elements.error.value = message;
  }
</script>
```

这样的原始代码看起来非常冗长，但它也非常稳定、直接且非常高效。

### 表单的 Input

通常，当我们构建一个 `SPA` 项目时，我们会使用某种类似 `JSON` 的 `API` 来更新我们的服务器或我们使用的任何模型。

下面是个简单的例子（一个联系人类型、以及一个更新联系人的方法）：

```ts
interface Contact {
  id: string;
  name: string;
  email: string;
  subscriber: boolean;
}

function updateContact(contact: Contact) { … }
```

在框架代码中，通过选择 `Input` 元素并逐个构造对象来生成这个 `Contact` 对象是很常见的操作。通过正确的使用表单，有个简洁的替代方案：

```html
<form name="contactForm">
  <input name="id" type="hidden" value="136" />
  <input name="email" type="email"/>
  <input name="name" type="string" />
  <input name="subscriber" type="checkbox" />
</form>

<script>
   updateContact(Object.fromEntries(
       new FormData(document.forms.contactForm));
</script>

```

借助 `FormData` 类，我们可以在 `DOM Input` 和 `JavaScript` 函数之间无缝转换这些数据。


### 组合表单和响应式

通过组合表单的高性能选择器稳定性和 `CSS` 响应性，我们可以实现更复杂的 UI 逻辑：

```html
<form name="contactForm">
  <input name="showErrors" type="checkbox" hidden />
  <fieldset name="names">
     <input name="name" />
     <output name="error"></output>
  </fieldset>
  <fieldset name="emails">
     <input name="email" />
     <output name="error"></output>
  </fieldset>
</form>

<script>
  function setErrorMessage(section, message) {
  document.forms.contactForm.elements[section].elements.error.value = message;
  }
  function setShowErrors(show) {
  document.forms.contactForm.elements.showErrors.checked = show;
  }
</script>

<style>
   input[name="showErrors"]:not(:checked) ~ * output[name="error"] {
      display: none;
   }
</style>

```

注意，在这个例子中没有使用 `class` — 我们从表单的数据中开发 `DOM` 的行为和样式，而不是去手动更改元素类。

我不喜欢过度使用 `CSS class` 作为 `JavaScript` 选择器。我认为它们应该用于将类似样式的元素组合在一起，而不是作为一种改变组件样式的万能机制。


### 表单的优点


- 表单是内置在 `Web` 平台中的原生 API，大部分功能都是稳定的。这意味着更少的 `JavaScript` 代码，更少的框架版本不匹配，并且没有“构建” 这样的环节。
- 默认情况下表单是可以访问的，它同样适用于键盘导航、屏幕阅读器等其他辅助技术。
- 表单具有内置的输入验证功能：我们可以通过正则表达式模式进行验证、借助 CSS 对无效和有效的表单、是否必选等进行处理，而不需要进行额外的开发。
- 表单的 `submit` 事件非常有用。例如，它允许在没有提交按钮的情况下捕获 `“Enter”` 键，并允许通过 `submitter` 属性区分多个提交按钮(在后面的例子中我们会看到这个)。
- 默认情况下，元素与它们所包含的表单相关联。这允许我们在不依赖 `DOM` 树的情况下处理表单关联。
- 使用稳定的选择器会让 UI 自动化测试更简单：我们可以使用嵌套 `API` 作为一种稳定的方式来和 `DOM` 挂钩，而不用管它的布局和层次结构是怎么样的。`form > (fieldsets) > element` 这样的层次结构可以作为文档的交互式骨架。


### CHACHA 

`Changes Channel` — 我们简称为 `CHACHA`，代表一个双向数据流，它可以通知 `intent` 方向和 `observe` 方向的变化，类似我们常说的双向绑定。

- 在 `intent` 方向上，UI 会通知模型用户打算进行的更改。
- 在 `observe` 方向上，模型会通知 UI 对模型所做的更改以及需要向用户显示的更改。

这是个挺有趣的名字，但它并不是一个很复杂或者很新颖的模式。双向数据流在 Web 或其他软件中都很常见（例如`MessagePort`）

`ChaCha` 的界面通常可以从 `App` 的规范中衍生出来，而无需任何 `UI` 代码。

例如，一个应用程序允许你添加和删除联系人，并从服务器加载初始列表(可以刷新)，它可以有这样一个 `ChaCha`:

```ts
interface Contact {
  id: string;
  name: string;
  email: string;
}
// "Observe" Direction
interface ContactListModelObserver {
  onAdd(contact: Contact);
  onRemove(contact: Contact);
  onUpdate(contact: Contact);
}
// "Intent" Direction
interface ContactListModel {
  add(contact: Contact);
  remove(contact: Contact);
  reloadFromServer();  
}

```

注意，这两个接口中的所有函数都是 `void`，并且只接收普通对象。这是故意这样做的，`ChaCha` 构建起来就像一个有两个端口的通道来发送消息，这允许它在 `EventSource、HTML MessageChannel、Service Worker ` 或任何其他协议中工作。

`ChaChas` 的优点是它很方便测试：你可以发送动作并期待特定的调用返回给观察者。


### 使用HTML模板渲染列表项

`HTML template` 是存在于 `DOM` 中但不会显示的特殊元素，它们的目的是生成动态元素。

当我们使用一个 `template` 元素时，我们可以避免在渲染或更新列表的时候频繁操作DOM，下面是个例子：

```html
<ul id="names">
  <template>
   <li><label class="name" /></li>
  </template>
</ul>
<script>
  function addName(name) {
    const list = document.querySelector('#names');
    const item = list.querySelector('template').content.cloneNode(true).firstElementChild;
    item.querySelector('label').innerText = name;
    list.appendChild(item);
  }
</script>

```

通过使用列表项的 `template` 元素，我们可以在原始 `HTML` 中看到这些列表项 — 而不是用 `JSX` 或其他语言 “渲染” 出来的。你的 `HTML` 文件现在会包含应用程序的所有 `HTML` — 静态部分是渲染的 `DOM` 的一部分，而动态部分在 `template` 中表示，在一定时机会被克隆并 `append` 到文档中。

## TodoMvc

`TodoMVC` 是一个用于展示不同框架的 `TODO LIST` 的应用程序规范。`TodoMVC` 模板带有现成的 `HTML` 和 `CSS`，可帮助你专注于框架。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/299cb7009f77497999400bf87a36de5d~tplv-k3u1fbpfcp-zoom-1.image)


Github：https://github.com/tastejs/todomvc


### 从规范派生的 CHACHA 开始

我们将基于 `TodoMVC` 的规范来构建 ChaCha 接口：

```ts
interface Task {
   title: string;
   completed: boolean;
}

interface TaskModelObserver {
   onAdd(key: number, value: Task);
   onUpdate(key: number, value: Task);
   onRemove(key: number);
   onCountChange(count: {active: number, completed: number});
}

interface TaskModel {
   constructor(observer: TaskModelObserver);
   createTask(task: Task): void;
   updateTask(key: number, task: Task): void;
   deleteTask(key: number): void;
   clearCompleted(): void;
   markAll(completed: boolean): void;
}

```

任务模型中的功能就来自于规范中描述的用户可以做什么样的事情（清除已完成的任务，将所有任务标记为已完成或未完成，获取未完成和已完成的任务数量）。

请注意，它遵循 `ChaCha` 的原则：

- 有两个接口，一个用于代理，一个用于观察。
- 所有参数类型都是原始类型或普通对象（很容易转换为 JSON）。
- 所有函数都返回 void。

我们用 `localStorage`（https://github.com/noamr/todomvc-app-template/blob/main/js/model.js） 来模拟一下后端。

这个 `Model` 非常简单，与这次我们UI框架的讨论没有太大关系。当需要用到时，它将保存到 `localStorage`，并在一些变化时向观察者触发更改的回调。

### 精简的、面向表单的 HTML  

接下来，我们将使用 `TodoMVC` 模板，并将它修改为基于表单的实现 — 表单的层次结构，输入和输出元素表示可以用 `JavaScript` 更改的数据。

我怎么知道某些东西是否需要成为一个表单元素？根据经验来看，如果它绑定到模型中的数据，那么它应该是一个表单元素。

下面是 `HTML` 的主要部分:

```html
<section class="todoapp">
   <header class="header">
       <h1>todos</h1>
       <form name="newTask">
           <input name="title" type="text" placeholder="What needs to be done?" autofocus>
       </form>
   </header>

   <main>
       <form id="main"></form>
       <input type="hidden" name="filter" form="main" />
       <input type="hidden" name="completedCount" form="main" />
       <input type="hidden" name="totalCount" form="main" />
       <input name="toggleAll" type="checkbox" form="main" />

       <ul class="todo-list">
           <template>
               <form class="task">
                   <li>
                       <input name="completed" type="checkbox" checked>
                       <input name="title" readonly />
                       <input type="submit" hidden name="save" />
                       <button name="destroy">X</button>
                   </li>
               </form>
           </template>
       </ul>
   </main>

   <footer>
       <output form="main" name="activeCount">0</output>
       <nav>
           <a name="/" href="#/">All</a>
           <a name="/active" href="#/active">Active</a>
           <a name="/completed" href="#/completed">Completed</a>
       </nav>
       <input form="main" type="button" name="clearCompleted" value="Clear completed" />
   </footer>
</section>

```

这个 `HTML` 包括下面的内容:

- 我们有一个 `main` 表单，其中包含所有全局输入和按钮，还有一个用于创建新任务的新表单。注意，我们使用 `form` 属性将元素与表单关联起来，以避免将元素嵌套在表单中。
- `template` 元素表示一个列表项，它的根元素是另一个表单，表示与特定任务相关的交互式数据。当添加任务时，可以通过克隆模板的内容来重复渲染这个表单。
- 隐藏的 `Input` 表示没有直接显示的数据，它们可能用于样式和选择。

这个 DOM 是非常简洁的，它的元素中没有分散的类。它包含了应用程序所需的所有元素，以合理的层次结构排列。由于隐藏的 `Input` 元素，你已经可以很好地了解文档稍后可能发生的更改。

这个 `HTML` 不知道它将被设置什么样的样式，也不知道它将绑定到什么数据。让 `CSS` 和 `JavaScript` 为 `HTML` 工作，而不是让 `HTML` 为特定的样式机制工作。这将使更改设计变得更加容易。

### 简单的 JavaScript 控制器

现在我们在 `CSS` 中拥有了大部分的响应式，并且我们在模型中拥有了列表处理的功能，剩下的就是控制器代码了，在这个小应用程序中，控制器 `JavaScript` 大约有 `40` 行。

```ts
import TaskListModel from './model.js';

const model = new TaskListModel(new class {

```

上面，我们创建了一个新模型。

```js
onAdd(key, value) {
   const newItem = document.querySelector('.todo-list template').content.cloneNode(true).firstElementChild;
   newItem.name = `task-${key}`;
   const save = () => model.updateTask(key,  Object.fromEntries(new FormData(newItem)));
   newItem.elements.completed.addEventListener('change', save);
   newItem.addEventListener('submit', save);
   newItem.elements.title.addEventListener('dblclick', ({target}) => target.removeAttribute('readonly'));
   newItem.elements.title.addEventListener('blur', ({target}) => target.setAttribute('readonly', ''));
   newItem.elements.destroy.addEventListener('click', () => model.deleteTask(key));
   this.onUpdate(key, value, newItem);
   document.querySelector('.todo-list').appendChild(newItem);
}

```

当一个 `item` 被添加到 `Model` 中时，我们会在 `UI` 中创建相应的 `item` 项目。

在上面，我们克隆了 `item` 的内容，`template` 为特定的 `item` 分配了事件监听器，并将新 `item` 添加到列表中。

请注意，这个函数，连同 `onUpdate、onRemove 和 onCountChange`，都是从 `Model` 中调用的回调函数。

```js
onUpdate(key, {title, completed}, form = document.forms[`task-${key}`]) {
   form.elements.completed.checked = !!completed;
   form.elements.title.value = title;
   form.elements.title.blur();
}
```

当一个项目被更新时，我们设置它的 `completed` 和 `title` 值，然后 `blur`（退出编辑模式）。

```js
onRemove(key) { document.forms[`task-${key}`].remove(); }

```

当从 `Model` 中删除一个 `item`，我们会从视图中删除其对应的列表项。

```js
onCountChange({active, completed}) {
   document.forms.main.elements.completedCount.value = completed;
   document.forms.main.elements.toggleAll.checked = active === 0;
   document.forms.main.elements.totalCount.value = active + completed;
   document.forms.main.elements.activeCount.innerHTML = `<strong>${active}</strong> item${active === 1 ? '' : 's'} left`;
}
```
在上面的代码中，当完成或未完成事项的数量发生变化时，我们设置适当的输入来触发 CSS 的响应，并格式化显示计数的输出。

```js
const updateFilter = () => filter.value = location.hash.substr(2);
window.addEventListener('hashchange', updateFilter);
window.addEventListener('load', updateFilter);

```

然后我们从 `hash fragment ` (以及在启动时)更新过滤器。上面我们所做的一切只是设置一个表单元素的值 — 其余的由 `CSS` 处理。

```js
document.querySelector('.todoapp').addEventListener('submit', e => e.preventDefault(), {capture: true});

```

这里，我们确保表单提交时不会重新加载页面。就是这几行代码把这个应用变成了 `SPA` 应用。

```js
document.forms.newTask.addEventListener('submit', ({target: {elements: {title}}}) =>   
    model.createTask({title: title.value}));
document.forms.main.elements.toggleAll.addEventListener('change', ({target: {checked}})=>
    model.markAll(checked));
document.forms.main.elements.clearCompleted.addEventListener('click', () =>
    model.clearCompleted());

```

这里处理主要操作（创建、标记、清除）。

### CSS 的响应式


CSS 处理了规范中的很多要求，我们看几个例子：

根据规范，`“X”（destroy）` 按钮只会在鼠标悬停时显示。我还添加了一个可访问性位，让它在任务集中时可见：

```css
.task:not(:hover, :focus-within) button[name="destroy"] { opacity: 0 }
```

当 `filter` 是当前链接时，会出现红色边框：

```css
.todoapp input[name="filter"][value=""] ~ footer a[href$="#/"],
nav a:target {
   border-color: #CE4646;
}
```

注意，我们可以使用 `link` 元素的 `href` 作为部分属性选择器 — 而不需要 `JavaScript` 检查当前的过滤器，并在适当的元素上设置一个选定的类。

我们还使用 `:target` 选择器，这使我们不必担心是否要添加过滤器。

标题输入的视图和编辑样式会根据其只读模式而变化：

```css
.task input[name="title"]:read-only {
…
}

.task input[name="title"]:not(:read-only) {
…
}
```

过滤操作（即仅显示未完成和已完成的任务）是使用选择器完成的：

```css
input[name="filter"][value="active"] ~ * .task
      :is(input[name="completed"]:checked, input[name="completed"]:checked ~ *),
input[name="filter"][value="completed"] ~ * .task
     :is(input[name="completed"]:not(:checked), input[name="completed"]:not(:checked) ~ *) {
   display: none;
}
```

上面的代码可能看起来有点冗长，使用 `CSS` 预处理器（如 `Sass`）可能可读性会更好。如果功能让这些样式代码变得越来越复杂，那么使用数据模型去实现会更好一点。


## 总结

我相信框架为了实现复杂的任务提供了非常方便的方法，并且它们具有超越技术本身的好处，比如让一组开发人员遵循特定的风格和模式。`Web` 平台提供了许多选择，采用一个框架可以让每个人至少部分地在其中一些选择上达成一致。这是有价值的。另外，声明式编程的优雅也有值得说明的地方，而组件化的主要特性并不是这篇文章讨论的内容。

但是请记住，存在替代模式，通常成本更低，并不是说需要的开发经验就越少。让自己对这些模式时刻感到好奇，后续我们再做技术选型时也会更加简单。


原生实现的简单回顾：

- 保持 DOM 树稳定，它会让后续开发更简单。
- 尽可能依靠 `CSS` 而不是 `JavaScript` 来实现响应式。
- 使用表单元素作为表示交互式数据的主要方式。
- 使用 `HTML template` 元素而不是 `JavaScript` 生成的模板。
- 使用双向数据流作为模型的接口。

本文译自：https://www.smashingmagazine.com/2022/02/web-frameworks-guide-part2/
本文中的完整示例代码：https://github.com/noamr/todomvc-app-template/


怎么样，这个的原生实现的 `TodoList` 你觉的怎么样？有解决框架给我们解决的问题吗？在实际开发里面，你会怎么选呢？




如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
