<template>
    <div>
        <h1>index page</h1>
        <h2> count: {{count}}</h2>
        <div class="animated infinite bounce">无限弹跳效果</div>
        <div>
            <button @click="increment">count++</button>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
export default {
    name: 'IndexView',
    computed: {
        count() {
            return this.$store.state.count
        }
    },
    created() {
        // 测速接口调用
        axios.get('http://127.0.0.1:4523/m1/832903-0-default/mp/desc?kdtId=123').then(function (res) {
                console.log(res);
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

</style>
