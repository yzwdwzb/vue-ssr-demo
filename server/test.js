const express = require('express');
const Vue = require('vue')

// 创建express 实例和Vue实例
const app = express();

//创建渲染器,用渲染器渲染page得到html内容
const renderer = require('vue-server-renderer').createRenderer()

//
const page = new Vue({
    data() { return { title: 'hhh' } },
    template: `<h1>hello, vue ssr  {{title}}</h1>`
})

app.get('/', async (req, res) => {
    try {
        const html = await renderer.renderToString(page)
        console.log(html)
        res.send(html)
    } catch (error) {
        res.status(500).send('服务器内部错误')
    }
})

app.listen(3000, () => {
    console.log('服务器启动成功!地址: http://localhost:3000/')
})