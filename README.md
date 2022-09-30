## SSR

将一个Vue组件在服务器端渲染为HTML字符串并发送到浏览器，最后再将这些静态标记"激活"为可交互应用程序的过程称为服务端渲染。

### 优点

- 利于SEO，由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面。
- 更快的内容到达时间，页面渲染的更快。

### 局限

- 开发条件受限，node环境
- 构建部署要求多，nodejs渲染
- 服务器负载变大

## 安装依赖

```shell
npm i vue-server-renderer express -D
```

`vue-server-renderer`的版本需要与项目的`vue`版本保持一致。

## 简单实现

新建一个vue项目，创建`./server/test.js`

```javascript
const express = require('express');
const Vue = require('vue')

// 创建express 实例和Vue实例
const app = express();

//创建渲染器,用渲染器渲染page得到html内容
const renderer = require('vue-server-renderer').createRenderer()

const page = new Vue({
    data() { return { title: 'hello' } },
    template: `<div>{{title}}, vue ssr!</div>`
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
```

在server下输入`node test.js` ,打开`http://localhost:3000/`即可看到页面



## 使用vue-router处理路由

### 安装

```shell
npm i vue-router -S
```

创建`./src/router/index.js` 、`./src/view/IndexView.vue`  和 `./src/view/DetailView.vue` 文件

### 配置

`router/index.js`

```javascript
import Vue from 'vue';
import Router from 'vue-router'

import IndexView from '@/view/IndexView.vue'
import DetailView from '@/view/DetailView.vue'

Vue.use(Router)

//每次用户请求都要创建router实例,保证独立性
export default function createRouter() {
    return new Router({
        mode:'history', // history模式
        routes:[
            {path:'/',component:IndexView},
            {path:'/detail',component:DetailView}
        ]
    })
}
```

平时我们在写客户端的时候，router文件直接导出一个实例，这里有所变动，需要导出一个创建实例的工厂函数，每次用户请求都要创建router实例,防止污染。

同时路由的模式需要指定`history`模式，因为`hash`模式不会将数据提交给服务器。

### 入口

`app.js`

```javascript
import Vue from 'vue'
import App from './App.vue'
import createRouter from './router'

//这里也是以工厂函数的形势导出，而不是实例。
//即用户每次访问都新建一个Vue实例
export default function createApp() {
    const router = createRouter()
    const app = new Vue({
        router,
        store,
        render:h=>h(App)
    })
    // .$mount()    这里不需要挂载 运行在服务器没地方挂
    return { app, router}
}
```

### 服务端入口

`entry-server.js`

```javascript
// 服务端入口 渲染首屏
import createApp from "./app";

//  context 从服务器获取，主要是获取请求的url
export default context =>{
    return new Promise((resolve,reject) => {
        const {app,router} = createApp()
        //进入首屏
        router.push(context.url)
        router.onReady(()=>{
            resolve(app);
        },reject)
    })
}
```

### 客户端入口

`entry-client.js`

```javascript
//挂载,激活app
import createApp from "./app";
const {app,router} = createApp()
router.onReady(()=>{
    app.$mount('#app') //挂载
})
```

### webpack打包配置

安装依赖

```shell
npm install webpack-node-externals lodash.merge cross-env -D
```

`vue.config.js`

```javascript
// webpack插件
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");
const nodeExternals = require("webpack-node-externals");
const merge = require("lodash.merge");

// 环境变量：决定入口是客户端还是服务端
const TARGET_NODE = process.env.WEBPACK_TARGET === "node";
const target = TARGET_NODE ? "server" : "client";

module.exports = {
  css: {
    extract: false
  },
  outputDir: './dist/'+target,
  configureWebpack: () => ({
    // 将 entry 指向应用程序的 server / client 文件
    entry: `./src/entry-${target}.js`,
    // 对 bundle renderer 提供 source map 支持
    devtool: 'source-map',
    // 这允许 webpack 以 Node 适用方式处理动态导入(dynamic import)，
    // 并且还会在编译 Vue 组件时告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
    target: TARGET_NODE ? "node" : "web",
    node: TARGET_NODE ? undefined : false,
    output: {
      // 此处告知 server bundle 使用 Node 风格导出模块
      libraryTarget: TARGET_NODE ? "commonjs2" : undefined
    },
    // 外置化应用程序依赖模块。可以使服务器构建速度更快，并生成较小的 bundle 文件。
    externals: TARGET_NODE
      ? nodeExternals({
          // 不要外置化 webpack 需要处理的依赖模块。
          // 可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
          // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
          allowlist: [/\.css$/]
        })
      : undefined,
    optimization: {
      splitChunks: undefined
    },
    // 这是将服务器的整个输出构建为单个 JSON 文件的插件。
    // 服务端默认文件名为 `vue-ssr-server-bundle.json`
    plugins: [TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin()]
  }),
  chainWebpack: config => {
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap(options => {
        merge(options, {
          optimizeSSR: false
        });
      });
  }
};
```

`package.json`

```json
{
  "scripts": {
    "build:client": "vue-cli-service build",
    "build:server": "cross-env WEBPACK_TARGET=node vue-cli-service build --mode server",
    "build": "npm run build:server && npm run build:client"
  },
}
```

### 宿主文件

`index.temp.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>vue-ssr</title>
</head>
<body>
    <!--vue-ssr-outlet-->
</body>
</html>
```

`<!--vue-ssr-outlet-->`为固定标识，前后不能有空格

### 服务器启动文件

所有路由都由vue接管，使用bundle渲染器生成内容

`server/index.js`

```javascript
const express = require('express');
const fs = require('fs')
// 创建express 实例和Vue实例
const app = express();

//创建渲染器
const {createBundleRenderer} = require('vue-server-renderer');
//服务端的包
const serverBundle = require('../dist/server/vue-ssr-server-bundle.json')
//客户端清单
const clientManifest = require('../dist/client/vue-ssr-client-manifest.json')

const renderer = createBundleRenderer(serverBundle,{
    runInNewContext:false,	//上下文
    template:fs.readFileSync('../public/index.temp.html','utf-8'),//宿主模板文件
    clientManifest
})

//中间件 处理静态文件请求
app.use(express.static('../dist/client',{index:false}))

//将路由处理交给vue
app.get('*', async (req, res) => {
    try {

        const context = {
            url:req.url,
            title:'hello vue ssr'
        }
        const html = await renderer.renderToString(context)
        res.send(html)
    } catch (error) {
        res.status(500).send('服务器内部错误')
    }
})

app.listen(3000, () => {
    console.log('服务器启动成功!地址: http://localhost:3000/')
})
```

## 使用Vuex

### 安装

```shell
npm i vuex -S
```

### 配置

`src/store/index.js`

```java
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

//与router类似 导出一个工厂函数而不是实例
export default function createStore() {
    return new Vuex.Store({
        state: {
            count: 0
        },
        mutations: {
            increment(state) {
                state.count++
            }
        }
    })
}
```

`app.js`

```javascript
import Vue from 'vue'
import App from './App.vue'
import createRouter from './router'
import createStore from './store'

export default function createApp() {
    const router = createRouter()
    const store = createStore()
    const app = new Vue({
        router,
        store,
        render:h=>h(App)
    })
    // .$mount()   #? 这里不需要挂载 没地方挂运行在服务器
    return { app, router}
}
```

## 打包

```shell
npm run build
```

server 目录下

```shell
node index.js
```

### 结果

