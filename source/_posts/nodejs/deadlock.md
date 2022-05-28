---
title: 如何排查死锁问题？
category: Node.js
tag: 
- Node.js
- 稳定性
- MySql
date: 2021-01-17
---

大家好，我是 [世奇](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)，笔名 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd)。


![](https://lsqimg-1257917459.cos.ap-beijing.myqcloud.com/20210117142705.png)

死锁是进程死锁的简称，是由 `Dijkstra` 于 `1965` 年研究银行家算法时首先提出来的。它是计算机系统乃至并发程序设计中最难处理的问题之一。我们平时比较会常遇到的应该就是数据库死锁了，例如下面就是我最近排查的一个死锁问题：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2f0be5bbe3464c5f9908cdc21fb90e8c~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c4e8ca0f3ed42828334afe748bad26a~tplv-k3u1fbpfcp-zoom-1.image)
本篇文章就借这个死锁问题的分析过程，来给大家讲一讲如何分析死锁问题。

## 死锁原理

在排查死锁问题前，我们先了解一下死锁相关的一些基本概念以及产生死锁的原理，之前我在公众号也发过一篇相关的文章，感兴趣可以详细读一下：[用个通俗的例子讲一讲死锁](https://mp.weixin.qq.com/s?__biz=Mzg2NDAzMjE5NQ==&mid=2247487661&idx=1&sn=273efa09185993eac7cbb21e427cd4e1&chksm=ce6ed401f9195d175218f2e60f153023a556a00f8463613b8151176a0e454d0e9b000e1d44f5&token=1158619790&lang=zh_CN#rd)

假设我们有一把蓝钥匙，可以打开一扇蓝色的门；以及一把红钥匙，可以打开一扇红色的门。两把钥匙被保存在一个皮箱里。同时我们定义六种行为：获取蓝钥匙，打开蓝色门，归还蓝钥匙，获取红钥匙，打开红色门，归还红钥匙。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5fb4d1e125a04d3eada3b064f8c4c28c~tplv-k3u1fbpfcp-zoom-1.image)

游戏规则是：一个人（线程）必须通过排列六种指令的顺序，打开两扇门，最后归还钥匙。假设我们现在有两个线程来同时进行上面的操作：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/723d199580e4466d8202d39861082e23~tplv-k3u1fbpfcp-zoom-1.image)

当两个线程都运行到第三步的时候，线程A在等线程B归还红钥匙，线程B在等线程A归还蓝钥匙，因而两个线程都永远卡在那里无法前进。这就是形成了死锁。

般来说死锁的出现必须满足以下四个必要条件：
> 互斥条件：指进程对所分配到的资源进行排它性使用，即在一段时间内某资源只由一个进程占用。如果此时还有其它进程请求资源，则请求者只能等待，直至占有资源的进程用毕释放。

只有一副钥匙
> 请求和保持条件：指进程已经保持至少一个资源，但又提出了新的资源请求，而该资源已被其它进程占有，此时请求进程阻塞，但又对自己已获得的其它资源保持不放。

拿着红钥匙的人在没有归还红钥匙的情况下，又提出要蓝钥匙
> 不剥夺条件：指进程已获得的资源，在未使用完之前，不能被剥夺，只能在使用完时由自己释放。

人除非归还了钥匙，不然一直占用着钥匙
> 环路等待条件：指在发生死锁时，必然存在一个进程——资源的环形链，即进程集合{P0，P1，P2，···，Pn}中的P0正在等待一个P1占用的资源；P1正在等待P2占用的资源，……，Pn正在等待已被P0占用的资源。

要避免出现死锁的问题，只需要破坏四个条件中的任何一个就可以了。

## Mysql 死锁

### 锁的类型

在 `MySQL` 中锁的种类有很多，但是最基本的还是表锁和行锁：表锁指的是对一整张表加锁，一般是 DDL 处理时使用，也可以自己在 `SQL` 中指定；而行锁指的是锁定某一行数据或某几行，或行和行之间的间隙。

```sql
mysql> lock table products read;
Query OK, 0 rows affected (0.00 sec)
 
mysql> select * from products where id = 100;
 
mysql> unlock tables;
Query OK, 0 rows affected (0.00 sec)
```

行锁的加锁方法比较复杂，但是由于只锁住有限的数据，对于其它数据不加限制，所以并发能力强，通常都是用行锁来处理并发事务。行锁和表锁对比如下：

- 表锁：开销小，加锁快；不会出现死锁；锁定粒度大，发生锁冲突的概率最高，并发度最低；
- 行锁：开销大，加锁慢；会出现死锁；锁定粒度最小，发生锁冲突的概率最低，并发度也最高。

一般发生死锁的情况也都是在行锁，所以我们下面重点看看行锁。


### 锁和索引

我们都知道，数据库中索引的作用是方便服务器根据用户条件快速查找数据库中的数据，`mysql innodb` 的锁是通过锁索引来实现的。
例如我们执行一条查询语句 `select for update`  如果字段没有索引，即使使用 `wehre` 条件也会进行表级锁。如果有索引，会锁定对应 `where` 条件中索引值的所有行，可理解为对该索引值进行了索引
有索引，而且使用了不同的索引值查数据，但是查询的结果是同一行，可以理解为真正的数据行锁。

### 行锁的类型

在 `MySQL` 的源码中定义了四种类型的行锁，这里我们简单提一下。

- 记录锁（`LOCK_REC_NOT_GAP`）: `lock_mode X locks rec but not gap`
    - 最简单的行锁，将锁锁在行上，这一行记录不能被其他人修改。
- 间隙锁（`LOCK_GAP`）: `lock_mode X locks gap before rec`
    - 加在两个索引之间的锁，使用间隙锁可以防止其他事务在这个范围内插入或修改记录，保证两次读取这个范围内的记录不会变，从而不会出现幻读现象。
- Next-key 锁（`LOCK_ORNIDARY`）: `lock_mode X`
    - 是记录锁和间隙锁的组合，它指的是加在某条记录以及这条记录前面间隙上的锁。
- 插入意向锁（`LOCK_INSERT_INTENTION`）: `lock_mode X locks gap before rec insert intention`
    - 种特殊的间隙锁，这个锁表示插入的意向，只有在 INSERT 的时候才会有这个锁。

### 行锁的模式

上面我们介绍了锁的类型，其实 `Mysql` 中的锁还有不同的模式，表示具体加的是什么锁，比如常见的锁模式有读锁和写锁，写锁又称排他锁或独占锁，对记录加了排他锁之后，只有拥有该锁的事务可以读取和修改，其他事务都不可以读取和修改，并且同一时间只能有一个事务加写锁。

### 一个死锁案例

好，上面的信息已经可以让我们分析一些死锁出现的常见 `case` 了，死锁的根本原因是有两个或多个事务之间加锁顺序的不一致导致的，比如我们来看一个最经典的死锁 `case`:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c2925a291fc45e597159b9c585f6a1d~tplv-k3u1fbpfcp-zoom-1.image)

首先，事务 A 获取 `id = 20` 的锁，事务 B 获取` id = 30` 的锁；然后，事务 A 试图获取` id = 30` 的锁，而该锁已经被事务 B 持有，所以事务 A 等待事务 B 释放该锁，然后事务 B 又试图获取 `id = 20` 的锁，这个锁被事务 A 占有，于是两个事务之间相互等待，导致死锁。

## Mysql 死锁日志查询

现在我们回来看死锁的报警，通过日志可以定位问题大概发生在什么位置，但是仍然无法定位是什么语句，这时我们可以查询数据库中的死锁日志来帮助我们分析问题到底处在哪里。

我们可以到数据库服务器执行 `SHOW ENGINE INNODB STATUS `命令，这个命令可以获取系统最近一次发生死锁时的加锁情况。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6e4ff95107b458087b5a7e1a1dab9c2~tplv-k3u1fbpfcp-zoom-1.image)

## 分析死锁日志

上面的日志比较长，下面我们来逐行分析一下上面的死锁日志的含义。

```sql
*** (1) TRANSACTION:

TRANSACTION 519070***, ACTIVE 0 sec fetching rows
```

ACTIVE 0 sec 表示事务活动时间，`inserting` 为事务当前正在运行的状态，可能的事务状态有：`fetching rows，updating，deleting，inserting` 等。

```sql
mysql tables in use 3, locked 3

LOCK WAIT 5 lock struct(s), heap size 1136, 3 row lock(s)
```

`tables in use 3` 表示有3个表被使用，`locked 3` 表示有3个表锁。`LOCK WAIT` 表示事务正在等待锁，`5 lock struct(s)` 表示该事务的锁链表的长度为 5，每个链表节点代表该事务持有的一个锁结构，包括表锁，记录锁以及 `autoinc` 锁等。

`heap size 1136` 为事务分配的锁堆内存大小。`3 row lock(s)` 表示当前事务持有的行锁个数。

```sql
MySQL thread id 6716703, OS thread handle 1401379786***, query id 235468*** 10.245.**.** arg99446*** Searching rows for update
```

事务的线程信息，以及数据库 IP 地址和数据库名，对我们分析死锁用处不大。

```sql
UPDATE issues_scm SET scm_id=188,issues_id=75,code_rule_id=83,code=2,result=0 WHERE issues_id = 75 AND scm_id = 188
```

这里显示的是正在等待锁的 `SQL` 语句，我们还要结合应用程序去具体分析这个 `SQL` 之前还执行了哪些其他的 `SQL` 语句

```sql
*** (1) WAITING FOR THIS LOCK TO BE GRANTED:

RECORD LOCKS space id 183 page no 4 n bits 424 index issue**** of table ****.issues_scm trx id 519070*** `lock_mode X locks rec but not gap waiting`
```
这里显示的是事务正在等待什么锁，可以看出要加锁的索引为 issue****。`lock_mode X` 表示该记录锁为排他锁， `rec but not gap waiting` 表示要加的锁为记录锁，并处于锁等待状态。

```sql
*** (2) TRANSACTION:

TRANSACTION 51907**, ACTIVE 0 sec fetching rows, thread declared inside InnoDB 1011

mysql tables in use 3, locked 3

5 lock struct(s), heap size 1136, 7 row lock(s)

MySQL thread id 20264658, OS thread handle 1401379****, query id 2354687863 10.245**** arg994**** Searching rows for update

UPDATE issues_scm SET scm_id=187,issues_id=75,code_rule_id=83,code=2,result=0 WHERE issues_id = 75 AND scm_id = 187

*** (2) HOLDS THE LOCK(S):

RECORD LOCKS space id 183 page no 4 n bits 424 index issue**** of table ****.issues_scm trx id 51907**** lock_mode X locks rec but not gap

*** (2) WAITING FOR THIS LOCK TO BE GRANTED:

RECORD LOCKS space id 183 page no 6 n bits 424 index PRIMARY of table ****.issues_scm trx id 51907**** lock_mode X locks rec but not gap waiting

*** WE ROLL BACK TRANSACTION (2)
```

事务二和事务一的日志基本类似，不过它多了一部分 `HOLDS THE LOCK(S)`，表示事务二持有什么锁，这个锁往往就是事务一处于锁等待的原因。这里可以看到事务二正在等待索引 issue**** 上的记录锁。

好了日志分析完了，我们再回想一下分析一个死锁需要的必要信息

- 事务 1 持有的锁，事务 1 等待的锁
- 事务 2  持有的锁，事务 2 等待的锁

再来看日志中的信息：

- 第一个框：事务1的等待
- 第二个框：事务2的持有
- 第三个框：事务2的等待

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/83a2c968cce7443fbe4a644b0f922104~tplv-k3u1fbpfcp-zoom-1.image)

如果，再有 事务2等待 == 事务1持有，死锁就成立了，但是 log 中看不到：事务1持有，但是因为死锁已经成立了，所以我们断定，事务2的等待 == 事务1的持有。

接下来，我们只要分析，为什么事务1会持有这个锁就好了。

## 解决方案

通过上面的死锁 log ，我们只能获取一部分信息，要知道为什么事务1会持有这个锁 还要根据具体业务进行分析，其实关键问题即出在下面这两条 sql：

```js
UPDATE issues_scm SET scm_id=188,issues_id=75,code_rule_id=83,code=2,result=0 WHERE issues_id = 75 AND scm_id = 188

UPDATE issues_scm SET scm_id=187,issues_id=75,code_rule_id=83,code=2,result=0 WHERE issues_id = 75 AND scm_id = 187
```

我们再来看看数据库的表结构：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e40d4f2c8f6042178987deb54b6bfffe~tplv-k3u1fbpfcp-zoom-1.image)

可以看到，`issues_id、scm_id` 两个字段分别被加了索引，实际上 `issues_id、scm_id` 的一个值都分别会对应多个字段的，达成事务隔离级别的要求，事务会尽可能的把所有影响的行都锁住。所以两条 sql 锁住的行的范围可能是有重叠的，这样在并发执行的时候，如果两条 `sql` 加锁的顺序不一致，就会出现死锁。

实际上，在刚才的操作中，我们并不希望两条 `sql` 都分别对范围加锁，因为【`issues_id、scm_id`】实际上可以决定一条唯一记录，我们两个事务也只需要锁住单行就可以了。

解决方法就是将两个字段建成 `uniq` 索引，这样并发时不同的 `sql` 也只是会锁住各自更新的单行，不会出现有 `gap` 的情况，也就不会发生死锁。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fdd38ac4dc26434791392575b4eb51c7~tplv-k3u1fbpfcp-zoom-1.image)


在众多 Mysql 死锁问题中，这只是相对简单的一个，但是只要掌握上面分析的要点，把两个事务的持有、等待的锁分析清楚，那么一定能找到问题原因以及解决方案，祝大家好运！


如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf#rd) 。
