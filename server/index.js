const express = require('express');
const fs = require('fs')
// 创建express 实例和Vue实例
const app = express();

//创建渲染器
const {createBundleRenderer} = require('vue-server-renderer');
const serverBundle = require('../dist/server/vue-ssr-server-bundle.json')
const clientManifest = require('../dist/client/vue-ssr-client-manifest.json')
const renderer = createBundleRenderer(serverBundle,{
    runInNewContext:false,
    template:fs.readFileSync('../public/index.temp.html','utf-8'),     //宿主模板文件
    clientManifest
})

//中间件 处理静态文件请求
app.use(express.static('../dist/client',{index:false}))


//将路由处理交给vue  '*'
app.get('*', async (req, res) => {
    try {

        const context = {
            url:req.url,
            title:'ssr test'
        }


        const html = await renderer.renderToString(context)
        console.log(html)
        res.send(html)
    } catch (error) {
        res.status(500).send('服务器内部错误')
    }
})

app.listen(3000, () => {
    console.log('服务器启动成功!地址: http://localhost:3000/')
})