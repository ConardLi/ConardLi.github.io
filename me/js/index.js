/**
 * 静态数据
 */
const array = [
    {
        name: '文章',
        data: [
            {
                url: 'https://conardli.github.io/',
                img: 'blog',
                title: '个人博客'
            },
            {
                url: 'https://segmentfault.com/u/conardli',
                img: 'segmentfault',
                title: 'segmentfault'
            },
            {
                url: 'https://blog.csdn.net/qq_34149805',
                img: 'csdn',
                title: 'CSDN'
            },
            {
                url: 'https://mp.toutiao.com/profile_v3/index',
                img: 'toutiao',
                title: '头条'
            },
            {
                url: 'https://mp.weixin.qq.com/',
                img: 'gongzhonghao',
                title: '公众号'
            },
            {
                url: 'https://www.nowcoder.com/activity/oj',
                img: 'niuke',
                title: '牛客'
            },
            {
                url: 'https://leetcode-cn.com/problemset/all/',
                img: 'leetcode',
                title: 'leetcode'
            },
            {
                url: 'https://www.v2ex.com/',
                img: 'v2ex',
                title: 'v2ex'
            },
            {
                url: 'https://juejin.im/activities/',
                img: 'juejin',
                title: '掘金'
            },
            {
                url: 'https://account.geekbang.org/dashboard/buy',
                img: 'jike',
                title: '极客时间'
            }
        ],
    },
    {
        name: '收藏',
        data: [
            {
                url: 'https://www.teambition.com/project/5b960a20b3bce100189e2427/tasks/scrum/5b960a21b3bce100189e2433',
                img: 'teambition',
                title: 'teambition'
            },
            {
                url: 'https://github.com/',
                img: 'github',
                title: 'github'
            },
            {
                url: 'https://www.npmjs.com/~conardli',
                img: 'npm',
                title: 'npm'
            },
            {
                url: 'https://console.cloud.tencent.com/cos5/bucket/setting?type=filelist&bucketName=lsqimg-1257917459&path=&region=ap-beijing',
                img: '7niu',
                title: '腾讯云'
            },
            {
                url: 'https://leancloud.cn/dashboard/data.html?appid=s1xL54gwvPRsIy3ciItiPhyD-gzGzoHsz#/Comment',
                img: 'leancloud',
                title: 'leancloud'
            },
            {
                url: 'https://www.weiyun.com/disk',
                img: 'weiyun',
                title: '腾讯微云'
            },
            {
                url: 'https://pixabay.com/',
                img: 'tuku',
                title: '图库'
            },
            {
                url: 'http://pp.163.com/pp/#p=11&c=-1&m=2&page=1',
                img: 'tuku',
                title: '图库'
            },
            {
                url: 'http://www.iconfont.cn/',
                img: 'aliicon',
                title: '阿里图标'
            },
            {
                url: 'https://web.umeng.com/main.php?c=site&a=frame&siteid=1275088352',
                img: 'cnzz',
                title: '站长统计'
            },
            {
                url: 'http://218.241.135.34:88/',
                img: 'cnzz',
                title: 'gitstar'
            },
            {
                url: 'https://wux-weapp.github.io/wux-weapp-docs/#/quickstart',
                img: 'cnzz',
                title: 'wux ui'
            }
        ],
    },
    {
        name: '文档',
        data: [
            {
                url: 'https://react.docschina.org/',
                img: 'yinji',
                title: '印记中文'
            },
            {
                url: 'https://react.docschina.org/',
                img: 'react',
                title: 'react中文'
            },
            {
                url: 'https://reactnative.cn/docs/getting-started/',
                img: 'react',
                title: 'react native'
            },
            {
                url: 'http://huziketang.mangojuice.top/books/react/lesson1',
                img: 'react',
                title: 'redux'
            },
            {
                url: 'http://es6.ruanyifeng.com/#docs/class#Class',
                img: 'es6',
                title: 'es6'
            },
            {
                url: 'https://electronjs.org/',
                img: 'electron',
                title: 'electron'
            }
        ]
    },
    {
        name: '工具',
        data: [
            {
                url: 'https://barcode.tec-it.com/zh/',
                img: 'tiaoma',
                title: '条码生成'
            },
            {
                url: 'https://cli.im/',
                img: 'erweima',
                title: '二维码生成'
            }
        ]
    },
    {
        name: '搜索',
        data: [
            {
                url: 'https://www.baidu.com/',
                img: 'baidu',
                title: '百度'
            },
            {
                url: 'https://www.google.com/?hl=zh_cn',
                img: 'geogle',
                title: 'geogle'
            }
        ]
    },
    {
        name: '阅读收藏',
        data: [
            {
                url: 'https://github.com/mqyqingfeng/Blog',
                img: 'yayu',
                title: '冴羽'
            }
        ]
    }
]

/**
 * 用于展示数据
 */
let showArray = array;

/**
 * 页面加载执行
 */
document.addEventListener('DOMContentLoaded', () => {
    render();
});

/**
 * 渲染
 */
function render() {
    let html = '';
    showArray.forEach(data => {
        let htmlTemplate = `<div class="type"><span class="typeTitle">${data.name}</span>`;
        data.data.forEach(element => {
            htmlTemplate += `  
     <a href="${element.url}" class="item" target="view_window">
      <img src="./img/${element.img}.png" class="icon" />
      <span class="title">
        ${element.title}
      </span>
    </a>`;
        });
        htmlTemplate += `</div>`;
        html += htmlTemplate;
    });
    document.getElementById('container').innerHTML = html;
}

/**
 * 根据分类过滤
 * @param {分类} type 
 */
function filterBytype(type) {
    showArray = array.filter((obj) => {
        return obj.name === type;
    });
    renderClass(type);
    render();
}

/**
 * 展示所有
 */
function showAll() {
    showArray = array;
    renderClass('全部');
    render();
}

/**
 * 渲染样式
 * @param {分类} type 
 */
function renderClass(type) {
    $('.nav>div').removeClass('typeActive');
    $(`#${type}`).addClass('typeActive');
}