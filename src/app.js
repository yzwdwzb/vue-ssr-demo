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
