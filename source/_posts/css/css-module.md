---
title: 如何像导入 JS 模块一样导入 CSS？
category: 样式和效果
tag: 
- CSS
- 最新提案
- 样式和效果
date: 2021-07-07
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


刚刚发布的 Chrome 93 版本中更新了一项令人兴奋的新特性：`CSS Module Script`，使用它你可以像导入一个 `JavaScript` 模块一样加载 `CSS` 样式。

然后，你可以将 CSS 样式与可构造样式表(`Constructable Stylesheet`) 相同的方式作用于 `document` 和 `shadow dom`，这比其他加载 CSS 的方式更方便、更高效。

## 什么是可构造样式表？

在了解 `CSS Module Script` 之前，我们先来了解下啥是可构造样式表(`Constructable Stylesheet`)。和表面意思一样，它是为了 `CssStyleSheet` 可直接构造而设计的，在 `document` 和 `shadow dom` 下都可以使用。

使用可构造样式表：

- 通过 `new CSSStyleSheet()` 构造一个样式表
- 改变可构造样式表
- 通过 `adoptedStyleSheets` 使用可构造样式表

改变可构造样式表有如下API：

- `insertRule(rule，index)` 往 `cssRules` 属性里插入 `rule`
- `deleteRule(rule，index)` 从 `cssRules` 属性里删除 `rule`
- `replace(text)` 异步替换 `cssRules`
- `replaceSync(text)` 同步的 `replace`

```js
// Construct the CSSStyleSheet
const stylesheet = new CSSStyleSheet();
 
// Add some CSS
stylesheet.replaceSync('body { background: #000 !important; }')
// OR stylesheet.replace, which returns a Promise instead
 
// Tell the document to adopt your new stylesheet.
// Note that this also works with Shadow Roots.
document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
```


## 使用 CSS Module Script

引入 `CSS Module Script` 将作用于 `document` 和 `shadow dom`，如下：

```js
import sheet from './styles.css' assert { type: 'css' };
document.adoptedStyleSheets = [sheet];
shadowRoot.adoptedStyleSheets = [sheet];
```

`CSS Module Script` 默认导出的是一个 `可构造样式表` ，与任何其他 `可构造样式表` 一样，它使用 `adoptedstylesheet` 作用于 `document` 和 `shadow dom`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f886e1246e554678ac2d1600ad509b73~tplv-k3u1fbpfcp-zoom-1.image)

和其他使用 `JavaScript` 引入 `CSS` 的方式不同，你无需创建一个 `<script>` 标签，也不需要把 `CSS` 插入混淆后的 `JavaScript` 中。


`CSS Module` 也有像 `JavaScript Module` 一样的优点：


- 重复数据删除：如果从应用的多个位置导入相同的 CSS 文件，它仍然只会被提取、实例化和解析一次。
- 一致的顺序：如果导入一个 `JavaScript` 运行时，它可以依赖于已经解析过的样式表。
- 安全性：模块使用 `CORS` 加载，并且使用严格的 `MIME` 类型检查。


## 导入断言（assert）是什么？

`import` 语句的 `assert {type: 'css'}` 部分是一个 `import` 断言，这是必需要声明的的；如果没有它，CSS 将被认为是一个普通的 `JavaScript` 模块，如果导入的文件具有非 `JavaScript MIME` 类型，则会导入失败。

```js
import sheet from './styles.css'; // Failed to load module script:
                                  // Expected a JavaScript module
                                  // script but the server responded
                                  // with a MIME type of "text/css".
```

## 样式表的动态导入

类似于 `JavaScript` 模块的动态导入，你还可以用 `dynamic import` 导入 CSS 模块：


```js
const cssModule = await import('./style.css', {
  assert: { type: 'css' }
});
document.adoptedStyleSheets = [cssModule.default];
```


> 这里有个坑需要注意，被添加到 `adoptedstylesheet` 的并不是 `cssModule` 本身，而是 `cssModule.default`。


## @import 的规则尚未支持


目前，`CSS@import` 的规则不适用 `于可构造样式表`，包括 `CSS Module Script`。如果 CSS 模块中含有`@import` 规则，则这些规则将被忽略。

```css
/* atImported.css */
div {
    background-color: blue;
}
```

```css
/* styles.css */
@import url('./atImported.css'); /* Ignored in CSS module */
div {
    border: 1em solid green;
}
```

```html
<!-- index.html -->
<script type="module">
    import styles from './styles.css' assert { type: "css" };
    document.adoptedStyleSheets = [styles];
</script>
<div>This div will have a green border but no background color.</div>
```


> 目前 `Firefox` 和 `Safari` 浏览器尚未支持，不过未来可期～


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。








