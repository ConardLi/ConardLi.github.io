module.exports = {
    title: 'ConardLi的blog',
    description: '系统性学习，打造完善的知识体系',
    base: '/blog/',
    themeConfig: {
        sidebarDepth: 2,
        lastUpdated: 'Last Updated',
        nav: [
            { text: '文章目录', link: '/article/' },
            { text: '博客', link: 'http://www.conardli.top' },
            { text: 'github', link: 'https://github.com/ConardLi' },
        ],
        sidebar: {
            '/article/': [
                '/article/',
                {
                    title: 'JS进阶',
                    children: [
                        '/article/JS进阶/你真的掌握变量和类型了吗（一）数据类型',
                        '/article/JS进阶/你真的掌握变量和类型了吗（二）类型转换',
                        '/article/JS进阶/如何写出一个惊艳面试官的深拷贝',
                    ]
                },
                {
                    title: 'React深入系列',
                    children: [
                        '/article/React深入系列/setState的执行机制',
                        '/article/React深入系列/React中key的正确使用方式',
                        '/article/React深入系列/React事件机制',
                        '/article/React深入系列/从Mixin到HOC再到Hook（一）',
                        '/article/React深入系列/从Mixin到HOC再到Hook（二）',
                        '/article/React深入系列/从Mixin到HOC再到Hook（三）',
                        '/article/React深入系列/从Mixin到HOC再到Hook（四）',
                        '/article/React深入系列/深入分析虚拟DOM的渲染原理和特性',
                    ]
                },
                {
                    title: '多端开发',
                    children: [
                        '/article/多端开发/移动端适配总结（二）应用篇',
                        '/article/多端开发/移动端适配总结（一）原理篇',
                        '/article/多端开发/用JS开发桌面应用（一）原理篇',
                        '/article/多端开发/用JS开发桌面应用（二）基本应用',
                        '/article/多端开发/用JS开发桌面应用（三）打印篇',
                        '/article/多端开发/用JS开发桌面应用（四）程序保护',
                        '/article/多端开发/用JS开发桌面应用（五）终篇',
                    ]
                },
                {
                    title: '浏览器和网络',
                    children: [
                        '/article/浏览器和网络/全面分析前端的网络请求方式（一）ajax',
                        '/article/浏览器和网络/全面分析前端的网络请求方式（二）fetch',
                        '/article/浏览器和网络/全面分析前端的网络请求方式（三）跨域',
                    ]
                },
                {
                    title: '前端工程化',
                    children: [
                        '/article/前端工程化/前端开发者必备的nginx知识',
                        '/article/前端工程化/前端代码质量-圈复杂度原理和实践',
                        '/article/前端工程化/前端工程化（一）npm包如何进行版本管理？',
                        '/article/前端工程化/前端工程化（二）package.json知多少？',
                        '/article/前端工程化/前端工程化（三）npminstall原理分析',
                        '/article/前端工程化/前端工程化-剖析npm的包管理机制（完整版）',
                    ]
                },
                {
                    title: '效果',
                    children: [
                        '/article/效果/看完这篇，你也可以实现一个360度全景插件（一）原理篇',
                        '/article/效果/看完这篇，你也可以实现一个360度全景插件（二）全景预览',
                        '/article/效果/看完这篇，你也可以实现一个360度全景插件（三）全景标记',
                    ]
                },
                {
                    title: '博客搭建',
                    children: [
                        '/article/博客搭建/【博客搭建】个人博客搭建及配置',
                    ]
                },
                {
                    title: '综合',
                    children: [
                        '/article/综合/【自检】前端知识清单',
                    ]
                },
                {
                    title: '技术圈',
                    children: [
                        '/article/技术圈/【技术圈】第1期',
                        '/article/技术圈/【技术圈】第2期',
                    ]
                }
            ]
        }
    }
};

