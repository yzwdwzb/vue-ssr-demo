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
export default {
    name: 'IndexView',
    computed: {
        count() {
            return this.$store.state.count
        }
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
