import Vue from 'vue';
import Router from 'vue-router'

import IndexView from '@/view/IndexView.vue'
import DetailView from '@/view/DetailView.vue'

Vue.use(Router)

// #? 这里为什么要导出一个工厂函数,而不是一个实例
//每次用户请求都要创建router实例,保证独立性
export default function createRouter() {
    return new Router({
        mode:'history', // #? 这里为什么要history
        routes:[
            {path:'/',component:IndexView},
            {path:'/detail',component:DetailView}
        ]
    })
}