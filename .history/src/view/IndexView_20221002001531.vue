<template>
    <div>
        <h1>index page</h1>
        <div>
            {{descTitle}}
        </div>
        <h2> count: {{count}}</h2>
       
        <div>
            <button @click="increment">count++</button>
        </div>
        <div class="animated infinite bounce box">无限弹跳效果</div>
    </div>
</template>
<script>
import axios from 'axios'
export default {
    name: 'IndexView',
    data(){
        return{
            descTitle:''
        }
    },
    computed: {
        count() {
            return this.$store.state.count
        }
    },
    created() {
        let that = this
        // 测速接口调用
        axios.get('http://127.0.0.1:4523/m1/832903-0-default/mp/desc?kdtId=123').then(function (res) {
                that.descTitle = res.data.data.descTitle
            }).catch(function (error) {
                console.log(error);
            }).then(function () {
         });
    },
    methods: {
        increment() {
            this.$store.commit('increment')
        }
    }
}
</script>
<style scoped>
.box{
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: blueviolet;
}
</style>
