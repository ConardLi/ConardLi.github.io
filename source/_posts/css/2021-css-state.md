---
title: 看完了 2021 CSS 年度报告，我学到了啥？
category: 样式和效果
tag: 
- CSS
- 报告解读
- 样式和效果
date: 2021-12-20
---


大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。

一年一度的 `CSS年度报告` 如期而至，我挑了一些我感兴趣的部分，和我一起来看看吧～

这篇文章用了很久，因为平时 CSS 写的实在少，其实看报告的主要目的除了了解CSS技术趋势，更重要的是顺便学习了下之前没用过的一些特性和库 😄


## 布局

### 弹性盒子（`Flex`）布局

相信大多数人都用过，就不多说了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/386ce4bf484b4d89a24b3f3166377f2b~tplv-k3u1fbpfcp-zoom-1.image)

### CSS 网格（`GRID`）布局

用的人越来越多了，只有 `0.7%` 的受访者没了解过，我在平时中也用过，不过用的不多，大多数场景下 `Flex` 就能满足需求，你们呢？

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c6d8176d375d4cf19a594374c078c972~tplv-k3u1fbpfcp-zoom-1.image)


### 子网格（`Subgrid`）布局

用过的人比去年多一些，不过没用过或者没了解过的仍然是大多数。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/439796f2a7ae4590ae9067172989e67f~tplv-k3u1fbpfcp-zoom-1.image)


说实话，我也是没用过，特意学习了一下，故名思议，除了操纵同级别的网格，它拥有操纵子网格的能力，它可以实现比 `Grid` 更复杂的布局，比如下面的例子：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(4, minmax(100px, auto));
  gap: 20px;
}

.item {
  display: grid;
  grid-column: 2 / 7;
  grid-row: 2 / 4;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  row-gap: 0;
}

.subitem {
  grid-column: 3 / 6;
  grid-row: 1 / 3;
}

```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/11081a8e6009439cb4fca3323eabfabc~tplv-k3u1fbpfcp-zoom-1.image)


### 多列布局（Multi-Column）

又是个我没用过的，不过好像这几年趋势变化也不大，大部分人还是没用过。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e76114837364f14a043753c328a9db7~tplv-k3u1fbpfcp-zoom-1.image)


查了下，还挺好用的，之前这样的事我都是用 `display:inline-block` 去搞，现在一个属性就搞定了。


```css
<div class="container">
  <h1> code秘密花园 </h1>
  <p> ConardLi </p>
  <p> 一些文本 ... </p>
</div>

.container {
  column-count: 3;
}
```



比如上面的 `container` 容器中有三个块级元素，给 `container` 指定 `column-count: 3` 后就可以让浏览器自动分成三列，并且计算出每一列分配多少空间。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52f679e69b1d4b008435eae5b73e294a~tplv-k3u1fbpfcp-zoom-1.image)


### position: sticky

这个就是我们平时所谓的吸顶布局，相信大多数小伙伴都用过或者了解过了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69f3822658f34d33bcc507da81658f6c~tplv-k3u1fbpfcp-zoom-1.image)


### 逻辑属性（Logical Properties）


`逻辑属性`，是 CSS 新引入的的一项变革性能力，它的属性与值能做从逻辑角度控制布局，而不是从物理、方向或维度来控制。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a3e5124626046d4a63da28470732480~tplv-k3u1fbpfcp-zoom-1.image)

目前调查来看，用过的人也不是很多，我们来简单介绍一下。


传统的 `CSS` 属性大多是采用物理属性来定义的，比如元素的尺寸，偏移和边距等属性。但是随着业务的发展，越来越多的web应用需要考虑到国家化，必须适配不同的语言。

大部分国家的语言排版都是从左到右，即`LTR(left to right)`，但是仍然有一部分语言采用的是从右到左，即`RTL(right to left)`的版本布局，比如阿拉伯语和希伯来语等。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f78aedc6eed243d3af3841d64f0ae14f~tplv-k3u1fbpfcp-zoom-1.image)

图片展示了拉丁文，希伯来文和日语三种不同的书写方式。


`逻辑属性` 不仅可以让前端的布局在逻辑上更加严谨，而且能让开发者以更少的代码写出兼容性更好的页面。我们来看个简单的例子：

html

```html
    <h3>物理布局</h3>
    <div class="container" id="">
        <div class="box">code</div>
        <div class="box">秘密花园</div>
    </div>

    <h3>逻辑布局</h3>
    <div class="container" id="logic">
        <div class="box">code</div>
        <div class="box">秘密花园</div>
    </div>
```

css

```css
        :root {
            --size: 100px;
        }

        .container {
            display: flex;
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #000;
            /* direction: rtl; */
        }

        .box {
            width: var(--size);
            height: var(--size);
            line-height: var(--size);
            text-align: center;
            background-color: rgb(170, 231, 71);
        }

        .container:nth-of-type(1) .box:last-child {
            margin-left: 10px;
        }

        .container:nth-of-type(2) .box:last-child {
            margin-inline-start: 10px;
        }
```

当页面布局是正常的从左到右排列时，效果是一样的：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c341f2650e90483db6ddc82f9718b6aa~tplv-k3u1fbpfcp-zoom-1.image)

现在我们把容器的排列方式改成：`direction: rtl;`，我们会发现物理布局出了问题：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5deba4ac3c7146af9aec67f0facdbd8c~tplv-k3u1fbpfcp-zoom-1.image)

在这段 CSS 里，`margin-inline-start` 就是一条逻辑属性，它可以让 margin 随着排版方向的变化而变化，而不是固定死的某一个方向。


向这样的逻辑属性还有很多：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01c5f88e825e48b990e98a7fd98848fa~tplv-k3u1fbpfcp-zoom-1.image)


### aspect-ratio

用于指定图片的纵横比，调查中大概 `37%` 的人用过。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a58676f797c14dfd840495eda2111ab9~tplv-k3u1fbpfcp-zoom-1.image)

我在之前很多篇文章中都提到过，是一个很好用的属性：

- [Web图像组件设计的最佳实践](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247491300&idx=1&sn=4ede69e1c0adbbd5ded29bf38f66e5f7&chksm=c2e2ebcff59562d976563649b09d3713dc54cc544dd3961ad2214427d549a78c798b65d7d94a&token=254251558&lang=zh_CN#rd)
- [Chrome 88 新功能解读](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490651&idx=1&sn=5aff7e9491851aa61c14613a44f7d497&chksm=c2e2e970f59560664c7f66c7760be924f9eb144f17da6db3f23c7555022be0499f8db3e347d5&token=254251558&lang=zh_CN#rd)
- [解读新一代 Web 性能体验和质量指标](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490403&idx=1&sn=9d408c8264fda966e3254ece8d663601&chksm=c2e2ee48f595675ef574b1e39ed72ea1e032ee0465e255da7a2dfafc7217521b205d3ef5120b&token=254251558&lang=zh_CN#rd)

给定图片的纵横比后，浏览器可以自动计算图片尺寸，可以用来提升 `CLS` 指标。

```css
aspect-ratio: 1 / 1;

/* 全局值 */
aspect-ratio: inherit;
aspect-ratio: initial;
aspect-ratio: unset;
```


### content-visibility

一个可以控制页面元素渲染的强大 CSS 属性，使用度今年好像和去年变化不大。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec823ce97ca949109acf4c11e54790c7~tplv-k3u1fbpfcp-zoom-1.image)


之前专门写过一篇文章来介绍它：

[一个可能让你的页面渲染速度提升数倍的CSS属性](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490511&idx=1&sn=fc0a9b56b22be27833ca6806eeb5ddc5&chksm=c2e2eee4f59567f20697c383fca5e1b85b819bd4aec2879ccbeb15a0afea5517ccbdcd93600d&token=254251558&lang=zh_CN#rd)

浏览器在接收到服务端返回的 `HTML` 之后，需要把这段数据渲染成用户看到的页面，在开始渲染第一个元素之前可能还需要经过很多步骤。这个过程会适用于整个页面，包括当前不可见的内容。

所以在首屏渲染时，是有很大一部分时间花费在用户不可见的内容上，实际上这部分数据我们没必要在首屏就把它们渲染出来。

`content-visibility: auto` 可以告诉浏览器暂时跳过该元素的布局和渲染工作，直到这个元素滚动到当前视口，从而可以加快整个页面的初始渲染，并且缩短用户和页面可交互需要花费的时间。

不过目前兼容性还比较差，慎重使用：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4c32673dacb443bb6c6bb26ef8d3aa0~tplv-k3u1fbpfcp-zoom-1.image)



### Container Queries

容器查询，目前还是一个在实验中的 CSS 特性，只有 `5%` 的人用过。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c7ee864c040c4a68b0a6846173ef4bc4~tplv-k3u1fbpfcp-zoom-1.image)

在我们要写一个响应式页面时，一般会试用媒体查询（`@media`）根据不同的页面尺寸进行不同的布局。

但是，`@media` 针对的是整个页面的显示大小，然而对于一些特定页面结构中的组件（例如在左右分栏的页面结构中的卡片），明明我们只是想根据组件的大小来调整布局，然而却得考虑整个网页的布局，以推测在不同页面大小下这个组件能够拥有的空间。

比如说，在下面这个布局中，组件可能是横向展示的，也可能是纵向展示的。如果宽度空间够的话，它显示为两列，如果没有空间，将会上下堆叠显示。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/59e171ef30984003b25d152f1483695b~tplv-k3u1fbpfcp-zoom-1.image)

这时候我们就可以用到容器查询：

```css
@container (min-width: 400px) {
  .c-article {
    display: flex;
    flex-wrap: wrap;
  }
}
@container (min-width: 700px) {
  .c-article {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 350px;
  }

  .card__thumb {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

```


目前兼容性感人：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c3b4aac519b471a8266d185ab036e3a~tplv-k3u1fbpfcp-zoom-1.image)

如果想试用，还要开启一个实验配置： `chrome://flags/#enable-container-queries`


## 图形和图像

### CSS 图形 (Shape)


`CSS Shape` 描述了在 CSS 中使用的几何形状的方式，它可以实现不规则的文字环绕效果，发展得真不咋地，没了解过的居然越来越多了 ...

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/98255d2cc7f84fd7b52f1672d19b3771~tplv-k3u1fbpfcp-zoom-1.image)


比如，我们左侧有个圆形的图片，我们想把右侧的文字环绕效果也改成圆形：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2b5f8d96bf914e569e0534a0325f457a~tplv-k3u1fbpfcp-zoom-1.image)

这时，我们就可以用到 `shape-outside`，它是不规则形状环绕布局的核心，有下面几个值：

- `circle()` – 圆
- `ellipse()` – 椭圆
- `inset()` – 内矩形（包括圆角矩形）
- `polygon()` – 多边形

我们将它指定为 `circle(50%)`，就可以实现圆形文字环绕效果。

``` css
img {
  float: left;
  shape-outside: circle(50%);
}
    
```

### object-fit

`object-fit` 是个比较常用的 CSS 属性，它可以指定可替换元素的内容应该如何适应到其使用的高度和宽度确定的框。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc4bc821b54546bd9b12cadb47fc846d~tplv-k3u1fbpfcp-zoom-1.image)


简单的说，通过这个属性我们可以让一个元素自适应外部容器：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ed900e9bb07b44dd8a5d1acd6c9456f0~tplv-k3u1fbpfcp-zoom-1.image)

`object-fit` 有下面五个值：

- `fill` 替换的内容正好填充元素的内容宽，替换内容拉伸填满整个content box，不保证保持原有的比例。
- `contain` 保持原有的尺寸比例。保证替换内容尺寸一定可以在容器里面放得下。因此，此参数可能在容器内一下空白。
- `cover` 保持原有的尺寸比例。保证替换内容尺寸一定大于容器尺寸，宽度和高度至少有一个和容器一致。因此，此参数可能会让替换内容部分区域不可见。
- `none` 保持原有的尺寸比例。同时保持替换内容原始尺寸大小。
- `scale-down` 内容的尺寸与 `none` 或 `contain` 中的一个相同，取决于它们之间谁得到的对象尺寸会更小。


### clip-path

这个做动画的同学应该平时也用的比较多，我们可以用它来裁剪出一个元素的可视区域，从调查来看使用者也越来越多。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9d641553cbc40f98c2cf0763222c75f~tplv-k3u1fbpfcp-zoom-1.image)

`clip-path` 是 `clip` 的升级版，它们的作用都是对元素进行 “剪裁”，不同的是 `clip` 只能作用于 `position` 为 `absolute` 和 `fixed` 的元素且剪裁区域只能是正方形，而 `clip-path` 更加强大，可以以任意形状去裁剪元素，且对元素的定位方式没有要求。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de97857ea3104592bbd4cfab62219713~tplv-k3u1fbpfcp-zoom-1.image)

### 混合模式 (Blend Modes)

`<blend-mode>`，是一种 CSS 数据类型，也就是我们常说的混合模式，可以用来描述当元素重叠时，颜色应当如何呈现。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/efad71419b1c431097417b62a23ba06b~tplv-k3u1fbpfcp-zoom-1.image)

> 当元素重叠时，混合模式是计算像素最终颜色值的方法，每种混合模式采用前景和背景的颜色值，执行其计算并返回最终的颜色值。最终的可见层是对混合层中的每个重叠像素执行混合模式计算的结果。

简单点说，就是有两张不同颜色的图片叠加时，中间重合的部分应该怎么展示。我们来看个简单的例子：


```css
        body {
            text-align: center;
            color: #000;
            background-image: linear-gradient(90deg, #fff 49.9%, #000 50%);
        }
        h1 {
            font-size: 100px;
        }
```

网页的两边分别有不同的两种颜色，我们在网页中间添加了个文本，文本的颜色和右边的网页颜色重合，所以右边啥也看不到：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3c328cefad194fd7acb9b0d90b4d3235~tplv-k3u1fbpfcp-zoom-1.image)

这时，我们该动一下文班的混合模式：

```css
        h1 {
            font-size: 100px;
            color: #fff;
            mix-blend-mode: difference;
        }
```

就可以实现下面的效果：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aa40ec9afe434682ab462c68a5cd4011~tplv-k3u1fbpfcp-zoom-1.image)

`mix-blend-mode: difference` 的意思就是重合部分取两种颜色的差值，除了`difference`，另外还有 `darken`(变暗)、`lighten`(变暗)、`screen`(滤色) 等等。


### CSS 滤镜效果

调查报告里使用最广的 CSS 属性之一，相信大多数小伙伴也都用过。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ef710dc0e2540318133a1fb958aa79f~tplv-k3u1fbpfcp-zoom-1.image)

一张图看懂它的主要用途：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ce957448241240a4b3ea6ff639f6cc4d~tplv-k3u1fbpfcp-zoom-1.image)

### color-gamut

`99%` 的人都没用过 ... 恭喜荣登本报告中知道的人最少的特性。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eee642e5afb14a7da79dfdd1445b3d7f~tplv-k3u1fbpfcp-zoom-1.image)

一个非常高级的用法，可以让我们根据输出设备的支持色域分类应用不同的样式，涨姿势了 ... 。

```css
@media (color-gamut: srgb) {
  p {
    background: #f4ae8a;
  }
}
```

### perspective

顾名思义，就是透视的意思，可以让我们实现一些简单的 3D 效果，不过现在用纯 `CSS` 写 `3D` 效果的少了，所以这个特性也用的越来越少了：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7cfbec911149486c89d4bd596217da8f~tplv-k3u1fbpfcp-zoom-1.image)


`perspective` 其实本质上是指定观察者与 `z=0` 平面的距离，从而让有三维位置变换的元素产生透视效果。`z>0` 的三维元素比正常大，而 `z<0` 时则比正常小，大小程度由该属性的值决定。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/363f8fa688e5473ab4d264dd451f4866~tplv-k3u1fbpfcp-zoom-1.image)


### Intrinsic Sizing

`Intrinsic Sizing`，即内在尺寸，今年第一次参加调查，但是大部分人都了解或者用过了，但是据我了解国内的网页里这个属性用的不错，因为对中文不太友好。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f20b037f0f714533a87c36bc4e9fdca7~tplv-k3u1fbpfcp-zoom-1.image)

`CSS` 中存在两种尺寸：内在尺寸（`intrinsic`）和外在尺寸（`extrinsic`）。元素的 `width、height` 设置的固定属性值，就是指外部尺寸。而内部尺寸，则是由元素包含的内容决定的。

我们来看洗面这个例子，两个 P 标签分别用两种内容的内在尺寸决定它本身的宽度。

```css
        h1 {
            border: 1px solid red;
            width: min-content;
        }

        .min {
            width: min-content;
        }

        .max {
            width: max-content;
        }
```

- `min-content` ：宽度等于最长单词的宽度
- `min-content` ：宽度等于整条内容的宽度（大概相当于 `display:inline-block` + `white-space:nowrap`）

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02ddaf4b4e6947c6ba5337077819eb13~tplv-k3u1fbpfcp-zoom-1.image)


这个章节其实还提到了 `backdrop-filter`、`conic-gradient()`、`color()`、`accent-color`，我没啥兴趣，所以就直接略过了。

## 交互

### CSS 滚动捕捉

CSS 滚动捕捉可以让用户完成滚动之后将视口锁定到某个元素的位置，这种效果经常出现在某些官网的网站里。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1e19e44af71457c89ace7445cf45c82~tplv-k3u1fbpfcp-zoom-1.image)

实现滚动捕捉主要依靠两个属性：容器元素的 `scroll-snap-type` 属性，以及子元素的  `scroll-snap-align` 属性。

- `scroll-snap-type:mandatory` 告诉浏览器，在用户停止滚动时，浏览器必须滚动到一个捕捉点。
- `scroll-snap-align` 可以指定元素的哪一部分吸附到容器上，`start` 指的是元素的顶部边缘。如果你水平滚动，它指的是左边缘。`center` 和 `end` 属性值与此同理。

来个简单的 Demo：

```html
    <div class="slider">
        <section id="s1">
            <h1>你好啊</h1>
        </section>
        <section id="s2">
            <h1>ConardLi</h1>
        </section>
        <section id="s3">
            <h1>code秘密花园</h1>
        </section>
    </div>
```

```css
        .slider {
            font-family: sans-serif;
            scroll-snap-type: x mandatory;
            display: flex;
            -webkit-overflow-scrolling: touch;
            overflow-x: scroll;
        }

        section {
            border-right: 1px solid white;
            padding: 1rem;
            min-width: 100vw;
            height: 100vh;
            scroll-snap-align: start;
            text-align: center;
            position: relative;
        }

        h1 {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            text-align: center;
            color: white;
            width: 100%;
            left: 0;
            font-size: calc(1rem + 3vw);
        }
```

你可以实现下面的效果：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/180ccd0a9e814b408ed78258a5bc6b1c~tplv-k3u1fbpfcp-zoom-1.image)


### overscroll-behavior

可以控制，滚动条到达滚动区域的边界时的行为。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/28e0388a35aa446db2a709d11e7b4104~tplv-k3u1fbpfcp-zoom-1.image)

比如我们在网页的右下角放了个机器人聊天窗口，我们在滚动聊天消息的时候，如果滚动到了底部，页面的其他部分也会跟着滚，这时候就可以用 `overscroll-behavior-y: contain;` 来设置在当前区域已经滚动到底部时，不会带动其他区域滚动。

### touch-action


`touch-action` 可以用于设置触摸屏用户如何操纵元素的区域（平滑、缩放、单指平移手势、手指平移和缩放等等），一般我们会在适配移动端操作的网站上会用到，变化趋势也不大，不再多说。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bd78c988c9024e9187a85c8254939058~tplv-k3u1fbpfcp-zoom-1.image)

### pointer-events

`pointer-events` 是个老属性了，可以用来控制特定元素和场景下的鼠标事件。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4cffb3a01c8149da955d678d0484b16b~tplv-k3u1fbpfcp-zoom-1.image)

比如，我们想禁用一个元素的点击事件，就可以用 `pointer-events:none`，这不仅仅会禁用元素的 `hover` 效果，而是真正的移除了 `click` 事件。

另外还有一些就是针对 SVG 元素的特定属性了，比如 `pointer-events: fill;`：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a1f9fd7612a41938070de1fba7d6188~tplv-k3u1fbpfcp-zoom-1.image)


### scroll-timeline

`scroll-timeline` 是一个可以更灵活的控制滚动动画的属性，在被采访者中只有 `2.5%` 的人用过。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9dc8893aa8f437ea5b7856faccc0fbb~tplv-k3u1fbpfcp-zoom-1.image)

`scroll-timeline` 还是一个比较早期的提案，属于 `Scroll-Linked Animations` 规范的一部分：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/086c4d2cf3fe4833a01015ef3eb778a0~tplv-k3u1fbpfcp-zoom-1.image)

像让页面滚动条滚动到某个位置、标题固定在顶部、面顶部展示你页面进度、或者是一些我们所说的视差滚动效果等等，在以前我们可能要借助 `JavaScript` 才能实现，现在我们可以使用 `@scroll-timeline`，比如下面的代码：

```css
@scroll-timeline scroll-in-document-timeline {
  source: auto;
  orientation: vertical;
  scroll-offsets: 0%, 100%;
}
```

- `source` 表示滚动的元素，默认情况下就是 `document`
- `orientation` 确定应当触发动画滚动方向。默认情况下是 `vertical`
- `scroll-offsets` 用于描述动画应处于活动状态的范围，它可以是相对、绝对值或者基于元素的偏移。

然后，我们将上面声明的时间轴动画的名称设置给 `animation-timeline` 属性，就可以和 CSS 动画关联上了。

```css
#progressbar {
  animation: 1s linear forwards adjust-progressbar;
  animation-timeline: scroll-in-document-timeline;
}

```


## 排版

### font-variant

`font-variant` 代表的其实是一组控制字体的 CSS 属性，从调查来看，用的人越来越少了 ...


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2f12671ce7014ac8b36de8fe435993c4~tplv-k3u1fbpfcp-zoom-1.image)


我们平时在开发里用的最多的可能就是 `font-variant:small-caps;` 了，它可以把所有小写字母转成大写。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/361bc07d50f14f02b6dacb34ce60e3a8~tplv-k3u1fbpfcp-zoom-1.image)


其实除了 `font-variant-caps` ，它还包括下面几个子属性：

- `font-variant-numeric`: 控制数字的展示形式
- `font-variant-alternates`: 控制备用字体的使用
- `font-variant-ligatures`: 控制是否连字展示



### initial-letter

`initial-letter` 可以控制首字母的展示形式，比如上升、下沉等效果，不过兼容性极差，也是用的人越来越少了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a0a7549068d340efa453281de340efdc~tplv-k3u1fbpfcp-zoom-1.image)


### line-clamp

`line-clamp` 可以用来限定一个块级容器中展示内容的行数，这个平时应该用的比较多。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3c59d86730ed4c70b3e57a6f904a6960~tplv-k3u1fbpfcp-zoom-1.image)


比如，我们要限定一个容器中最多展示两行，文字，超过两行的内容用省略号替代：

```css
        .box {
            width: 300px;
            height: 100px;
            border: 1px solid red
        }

        p {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            text-overflow: ellipsis;
            overflow: hidden;
            -webkit-box-orient: vertical;
            word-wrap: break-word;
            word-break: break-all;
        }
```


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/945adf72e6e944d1a1c2990bcaa52d1d~tplv-k3u1fbpfcp-zoom-1.image)

### Variable fonts

可变字体（`Variable Fonts`），今年第一次参与调查，大概 `20%` 的人有用过。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e69a237372db4ccf9b0202f7a9bec00e~tplv-k3u1fbpfcp-zoom-1.image)

一般来说，字体的不同格式，比如斜体、粗细、拉伸存储在分开的单个文件内，而现在，你可以存储多种字体格式在一个 `openType` 可变字体文件内，所以，这种文件相对来说体积会更小。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52dfba3fdbf24fd297e4d0ed42cde677~tplv-k3u1fbpfcp-zoom-1.image)

另外，我们可以借助 `Variable Fonts` 为网站提供更丰富、更灵活、更细粒度的的自定义字体能力(比如说 `font-weight:550` 就是属于细粒度的字体控制)，以适应不同风格和主题的变化。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0cfd2bed42694c12a1ec7d732ee55fef~tplv-k3u1fbpfcp-zoom-1.image)

## 其他特性


### CSS 变量（自定义属性）

CSS 变量，使用率已经高达 `84%`，没听过的仅有 `2.8%`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ebead90f92b843ddb552f9c85922c40f~tplv-k3u1fbpfcp-zoom-1.image)

用法很简单，声明变量的时候，变量名前面要加两根连词线（`--`），相信大多数小伙伴也都用过，不再多说：

```css
:root {
    --bg-color: red;
}
.title {
    background-color: var(--bg-color);
}
.desc {
    background-color: var(--bg-color);
}
```

### 特征查询(Feature Support Queries)

特征查询也就是 `@supports`，是条件规则的一种，可以用来检测当前浏览器是否支持某个CSS属性，这个确实挺实用的，使用率逐年增长。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b3ed806a0fb44d1581aa6755a893b739~tplv-k3u1fbpfcp-zoom-1.image)

用法广泛，比如下面几种：

检测是否支持指定的 CSS 属性

```css
@supports (animation-name: test) {
    @keyframes { 
      …
    }
}
```

检测是否不支持指定的CSS属性

```css
@supports ( not ((text-align-last:justify) or (-moz-text-align-last:justify) ){
    … /* 这里的CSS代码用来模拟text-align-last:justify */
}
```

测试是否支持某个自定义属性

```css
@supports (--foo: green) {
  body {
    color: var(--varName);
  }
}
```

测试浏览器否支持某个选择器

```css

@supports not selector(:is(a, b)) {
  /* 不支持 :is() 时的备选方案 */
  ul > li,
  ol > li {
    … /* 以上给不支持 :is(...) 的浏览器展开了 CSS 选择器规则 */
  }
}
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/54315c37c4ff4963b2331ae7e31e1eba~tplv-k3u1fbpfcp-zoom-1.image)

不过，作为一个用来做兼容性检测的特性，居然在 `IE` 下全跪，只能说 `IE` 牛逼！

### CSS 约束 （Containment）

`CSS contain` 属性允许开发者声明当前元素和它的内容尽可能的独立于 DOM 树的其他部分，这是个性能优化利器，居然只有不到 `10%` 的人用过。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2d2e0a28975461ba0078644a32fa96c~tplv-k3u1fbpfcp-zoom-1.image)

`contain` 属性的主要目的是隔离指定内容的样式、布局和渲染。开发人员可以使用这个 `contain` 属性来限制指定的 DOM 元素和它的子元素同页面上其它内容的联系；我们可以把它看做一个 `iframe` 。跟 `iframe` 很相似，它能建立起一个边界，产生一个新的根布局；保证了它和它的子元素的 `DOM` 变化不会触发父元素重新布局、渲染等。

这个属性在包含大量独立组件的页面非常实用，它可以防止某个小部件的 `CSS` 规则改变对页面上的其他东西造成影响，`contain` 属性有以下七个值：

- `none` 无
- `layout` 开启布局限制
- `style` 开启样式限制
- `paint` 开启渲染限制
- `size` 开启size限制
- `content` 开启除了size外的所有限制
- `strict` 开启 layout, style 和 paint 三种限制组合

对于页面上的一些独立的小部件，都推荐使用 `contain: strict;`，对页面性能很有帮助，目前使用度还比较低，强烈推荐！

### will-change

`will-change` 也是一个用来做性能优化的属性，相比上面的 `contain`，它的使用度要高一点。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bbde8cfb009e41a18f0a16048eb6a23b~tplv-k3u1fbpfcp-zoom-1.image)

当我们通过某些行为（点击、移动或滚动）触发页面进行大面积绘制的时候，浏览器往往是没有准备的，只能被动使用 `CPU` 去计算与重绘，由于没有事先准备，应付渲染够呛，于是掉帧。

`will-change` 可以在行为触发之前告诉浏览器我们要进行一些什么样的变化操作，让浏览器好有个准备，启动 `GPU` 为你渲染动画。

当然，用好这个属性也有点难度，一般直接写在 CSS 的默认状态中是没用的，下面我们举两个简单的例子：

结合 `JavaScript` 用：

```js
var el = document.getElementById('element');

// 当鼠标移动到该元素上时给该元素设置 will-change 属性
el.addEventListener('mouseenter', hintBrowser);
// 当 CSS 动画结束后清除 will-change 属性
el.addEventListener('animationEnd', removeHint);

function hintBrowser() {
  // 填写上那些你知道的，会在 CSS 动画中发生改变的 CSS 属性名们
  this.style.willChange = 'transform, opacity';
}

function removeHint() {
  this.style.willChange = 'auto';
}
```

在 CSS 里用：
```css
.will-change {
	transition: transform 0.3s;
}
.will-change:hover {
	will-change: transform;
}
.will-change:active {
	transform: scale(1.5);
}
```

如果用好的话，也是性能优化的一大利器。

### calc()

计算属性，使用率已经高达 `93%`，相信大多数同学都用过了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7eec487cc39d4aa49328a37d779be17e~tplv-k3u1fbpfcp-zoom-1.image)


不多说了， 在布局和动画中都是非常常用的，比如 `height: calc(100vh - 80px);`。

### Houdini

`Houdini` 是个非常强大的能力，可以扩展 `CSS` 的跨浏览器绘制能力，木过的人只有 `3%`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/978b84a950c64195aa145c0b3994f25d~tplv-k3u1fbpfcp-zoom-1.image)

`Houdini` 通过 `Typed Object Model` 启用更多的语义化 `CSS` 。开发者可以通过属性和值 API 定义具有语法、默认值和继承的高级 `CSS` 自定义属性。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0db02c0c54cb4d12a2df90dee57e135e~tplv-k3u1fbpfcp-zoom-1.image)


我之前专门写了一篇文章介绍 `Houdini` ，感兴趣的话可以看：

[使用 Houdini 扩展 CSS 的跨浏览器绘制能力](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490850&idx=1&sn=c5e68122ec4586a8872dd5d83afad966&chksm=c2e2e809f595611ff2b72c9e1b0c900dbe3a9acc06a6ec21d23f24b833f7dbc1707b39111dd7&token=254251558&lang=zh_CN#rd)

### CSS 比较函数 （Comparison Functions）

`CSS` 中的 `min，max` 函数都是属于比较函数，作用类似于 `js` 函数中的 `min，max`，用于取多个属性中的最小值或者最大值，属性之间用逗号分隔，比如（`width: min(100px,200px,300px);`）

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bdfd94d3af274007b7717ccf33b24dee~tplv-k3u1fbpfcp-zoom-1.image)

## 预处理

在开始之前，我们先对常用的几大预处理框架做个简单的对比：

- `Sass/Scss`：`sass` 分为 `sass` 和 `scss` 两个语法分支，`scss` 是兼容 css 的写法，很容易上手，同时继承了 `sass` 的优点，用的比较多的是 `scss` ，`sass` 的语法则是用缩进来代替花括号、省略了结尾分号。`sass` 速度更快且易安装，因为 `scss` 兼容 css 写法，写起来更容易上手，像 `bootstrap`、`Element` 也在使用 scss 作为 css 预处理器使用。
- `Less`：日常开发 `Less` 和 `Scss` 差不多，都是偏原生语法，比较容易接纳，`less` 有个优势就是可以“不用编译”，为啥加引号呢，因为它确实可以做到不手动编译，在引入 `less` 的后面引入 `less.js` 即可，但是作为最佳实践，你始终应该去编译它，因为大多数情况下，编译它并不会花掉你太多时间。
- `stylus` 采用了 `sass` 类似的缩进来表示层级，以及省略了分号等等，声明变量也不再需要 $ 或者 @ 符号，变量名和变量值之间使用 = 作为分隔，同时 `stylus` 允许传统 `css` 语法和 `stylus` 语法混用。因为其精简的太多，代码量可以更少，但是阅读起来可能不是那么美妙。
- `PostCSS` 一个使用JS插件来转换样式的工具，它跟CSS预处理器的定位其实不同，它的作用主要有 `lint css`，支持 `CSS Next` 语法，自动添加前缀等等功能，通过插件，基本上可以覆盖 CSS 预处理器的功能，同时可以实现很多预处理器实现不了的功能。优势在于其丰富的插件生态，能够覆盖开发中的方方面面，我们又能够很容易的开发自己的插件。

### 满意度


PostCSS 常年第一，不过今年新参加的 `Assembler CSS` 好像有点惨，关注度还行，不过无论是使用度还是满意度都比较差。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7623a9d9b4374a2a9cfc065a68c5da55~tplv-k3u1fbpfcp-zoom-1.image)

### 使用度

`Sass` 使用度仍然第一，`PostCSS` 反超 `Less`。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3dd79ada908249c0818e23e7a6bb54a5~tplv-k3u1fbpfcp-zoom-1.image)

### 随着时间变化的体验

这个比较有意思，`Less、Sass` 的满意度随时间推移都是有所下降的，而 `PostCSS` 在逐步上升。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a7bae2695d7d4e068d35541c5384dfd1~tplv-k3u1fbpfcp-zoom-1.image)

### 积极和消极程度

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fe6e8b20ed04a0fb26432ac3e4cdc5d~tplv-k3u1fbpfcp-zoom-1.image)

## CSS 框架

框架就不做过多介绍了，使用过的基本上都知道。

### 满意度

这里的亮点是 `Ant Design`，满意度逐年增长，国货之光啊！


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c1cbca09a004a1c88d3b76299262965~tplv-k3u1fbpfcp-zoom-1.image)

### 使用度

没想到 `Bootstrap` 还能占据第一，我 5 年前就放弃了，另外老外用的比较多的还是 `Tailwind CSS` ，增长率非常快，`Ant Design` 还是我们用的比较多，整体使用度只有 `16%` 。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/be69751c9fb048358f2b3288eba42d13~tplv-k3u1fbpfcp-zoom-1.image)

## CSS-in-JS

我个人也在用 `CSS-in-JS` ，第一个它解决了命名的痛点，传统的 `css` 方案，因为 `class name`是全局的，你就要保证它的唯一性，你要把你的组件名等各种 `namespace` 作为 `class name` 的前缀，以保证唯一性，`css in js` 就解决了这一点。另外，使用 `CSS-in-JS` 使用 js 动态控制样式会更简单。

### 满意度

大部分 `CSS-in-JS` 框架的满意度都有所下降... 

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/df136730961245089078addc9e6740be~tplv-k3u1fbpfcp-zoom-1.image)

这个也比较正常，因为它的缺点也比较明显，一直没得到解决：

- 运行时消耗：于大多数的 `CSS-in-JS` 的库都是在动态生成CSS的，一般都会有些性能损耗，而且包体积会稍大一些。
- 代码可读性差：大多数 `CSS-in-JS` 实现会通过生成唯一的CSS选择器来达到CSS局部作用域的效果，这些自动生成的选择器会大大降低代码的可读性。
- 没有统一的业界标准  `CSS-in-JS` 只是一种技术思路而没有一个社区统一遵循的标准和规范，所以不同实现的语法和功能可能有很大的差异。




### 使用度

这个没啥变化，`Styled Components` 的使用率是最高的。


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1c2943d46564fa58a453c32029510b2~tplv-k3u1fbpfcp-zoom-1.image)


通过 `Styled Components` ，你可以使用 `ES6` 的标签模板字符串语法为需要 `styled` 的 `Component` 定义一系列 `CSS` 属性，当该组件的JS代码被解析执行的时候， `Styled Components`  会动态生成一个 `CSS` 选择器，并把对应的 `CSS` 样式通过 `style` 标签的形式插入到 `head` 标签里面。动态生成的 `CSS` 选择器会有一小段哈希值来保证全局唯一性来避免样式发生冲突。


我个人用的是 `Emotion CSS` ，它和 `Styled Components` 基本上差不多，不过它对  `sourcemap` 的支持会更好一点。

```jsx
import { css, jsx } from '@emotion/react'

const color = 'darkgreen'

render(
  <div
    css={css`
      background-color: hotpink;
      &:hover {
        color: ${color};
      }
    `}
  >
    Hello ConardLi
  </div>
)

```

`CSS-in-JS Playground` 是一个可以快速尝试不同 `CSS-in-JS` 实现的网站，如果你想做技术选型，可以去看看：


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7669da2cc5d34dff89e0cec1152e363d~tplv-k3u1fbpfcp-zoom-1.image)

## 大奖

- 使用度采用最多的特性：`CSS 比较函数`，相比去年增长了 `15.5％`。
- 最高满意度：`PostCSS` 再次以 91% 的满意度位居榜首。
- 最受关注：`CSS Modules` 再次以 `74%` 的比例引起了 CSS 开发人员的最大兴趣。



## 调查范围




最后吐槽一下这个报告的调查范围，中国这么多开发者居然只调查了 `75` 个人，占所有受访者的 `0.9%` ，差评！



## 最后

本文中只节选一些报告中我感兴趣的内容，并非报告全文，想要了解更多请查看报告原文：`https://2021.stateofcss.com/`


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。








