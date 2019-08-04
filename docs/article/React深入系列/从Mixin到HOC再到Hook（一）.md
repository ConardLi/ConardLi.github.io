---
title: 从Mixin到HOC再到Hook（一）
date: 2019-04-09 23:27:27
tags:
     - React
---

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hoc9.png)

## 导读

前端发展速度非常之快，页面和组件变得越来越复杂，如何更好的实现`状态逻辑复用`一直都是应用程序中重要的一部分，这直接关系着应用程序的质量以及维护的难易程度。

本文介绍了`React`采用的三种实现`状态逻辑复用`的技术，并分析了他们的实现原理、使用方法、实际应用以及如何选择使用他们。

本文略长，下面是本文的思维导图，您可以从头开始阅读，也可以选择感兴趣的部分阅读：

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/hook2.png)


## Mixin设计模式

![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/mixin.png)

`Mixin`（混入）是一种通过扩展收集功能的方式，它本质上是将一个对象的属性拷贝到另一个对象上面去，不过你可以拷贝`任意多`个对象的`任意个`方法到一个新对象上去，这是`继承`所不能实现的。它的出现主要就是为了解决代码复用问题。

很多开源库提供了`Mixin`的实现，如`Underscore`的`_.extend`方法、`JQuery`的`extend`方法。

使用`_.extend`方法实现代码复用：

```js
var LogMixin = {
  actionLog: function() {
    console.log('action...');
  },
  requestLog: function() {
    console.log('request...');
  },
};
function User() {  /*..*/  }
function Goods() {  /*..*/ }
_.extend(User.prototype, LogMixin);
_.extend(Goods.prototype, LogMixin);
var user = new User();
var good = new Goods();
user.actionLog();
good.requestLog();
```

我们可以尝试手动写一个简单的`Mixin`方法：

```js
function setMixin(target, mixin) {
  if (arguments[2]) {
    for (var i = 2, len = arguments.length; i < len; i++) {
      target.prototype[arguments[i]] = mixin.prototype[arguments[i]];
    }
  }
  else {
    for (var methodName in mixin.prototype) {
      if (!Object.hasOwnProperty(target.prototype, methodName)) {
        target.prototype[methodName] = mixin.prototype[methodName];
      }
    }
  }
}
setMixin(User,LogMixin,'actionLog');
setMixin(Goods,LogMixin,'requestLog');
```

您可以使用`setMixin`方法将任意对象的任意方法扩展到目标对象上。

## React中应用Mixin

`React`也提供了`Mixin`的实现，如果完全不同的组件有相似的功能，我们可以引入来实现代码复用，当然只有在使用`createClass`来创建`React`组件时才可以使用，因为在`React`组件的`es6`写法中它已经被废弃掉了。

例如下面的例子，很多组件或页面都需要记录用户行为，性能指标等。如果我们在每个组件都引入写日志的逻辑，会产生大量重复代码，通过`Mixin`我们可以解决这一问题：

```js
var LogMixin = {
  log: function() {
    console.log('log');
  },
  componentDidMount: function() {
    console.log('in');
  },
  componentWillUnmount: function() {
    console.log('out');
  }
};

var User = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});

var Goods = React.createClass({
  mixins: [LogMixin],
  render: function() {
    return (<div>...</div>)
  }
});
```

## Mixin带来的危害

`React`官方文档在[Mixins Considered Harmful](https://react.docschina.org/blog/2016/07/13/mixins-considered-harmful.html)一文中提到了`Mixin`带来了危害：

- `Mixin` 可能会相互依赖，相互耦合，不利于代码维护
- 不同的` Mixin `中的方法可能会相互冲突
- `Mixin`非常多时，组件是可以感知到的，甚至还要为其做相关处理，这样会给代码造成滚雪球式的复杂性

`React`现在已经不再推荐使用`Mixin`来解决代码复用问题，因为`Mixin`带来的危害比他产生的价值还要巨大，并且`React`全面推荐使用高阶组件来替代它。另外，高阶组件还能实现更多其他更强大的功能，在学习高阶组件之前，我们先来看一个设计模式。

## 装饰模式
![image](https://lsqimg-1257917459.cos-website.ap-beijing.myqcloud.com/blog/decorator.png)

装饰者(`decorator`)模式能够在不改变对象自身的基础上，在程序运行期间给对像动态的添加职责。与继承相比，装饰者是一种更轻便灵活的做法。




文中如有错误，欢迎在评论区指正，谢谢阅读。

