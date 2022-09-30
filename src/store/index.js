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
