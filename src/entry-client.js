//客户端入口
//挂在,激活app
import createApp from "./app";

const {app,router} = createApp()

router.onReady(()=>{
    app.$mount('#app') //挂载
})