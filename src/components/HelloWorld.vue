<template>
  <div class="hello">
    <el-button>组件按钮</el-button>
    <el-button @click="apiTestApi">api请求</el-button>
  </div>
</template>

<script>
import { apiTest } from '@/api/hello-world'
export default {
  name: 'HelloWorld',
  components: {

  },
  methods: {
    async apiTestApi() {
      try {
        await apiTest()
      } catch (error) {
        throw new Error()
      }
    }
  }
}
</script>

<style scoped>

</style>
