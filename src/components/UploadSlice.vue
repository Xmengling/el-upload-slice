<!--
 * @Author: c28381 cheng.mengling@h3c.com
 * @Date: 2023-03-14 17:40:54
 * @LastEditors: c28381 cheng.mengling@h3c.com
 * @LastEditTime: 2023-03-14 17:49:26
 * @FilePath: \el-upload-slice\src\components\UploadSlice.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
