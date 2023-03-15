<template>
  <div id="app">
    <div class="upload-wrap">
      <UploadSlice
        :action="uploadInfoSlice.actionChunk"
        :headers="uploadInfoSlice.headers"
        :limit="uploadInfoSlice.limit"
        :accept="uploadInfoSlice.accept"
        :show-file-list="false"
        multiple
        cancelable
        :on-success="handleSuccess"
        :on-remove="handleRemove"
        :on-cancel="handleCancel"
        :on-upload-pre="handleUploadPre"
        :on-upload-merge="handleUploadMerge"
        :on-form-data="genFormData"
      />
    </div>
  </div>
</template>

<script>
import UploadSlice from './components/UploadSlice.vue'
import { uploadPre, uploadMerge } from '@/api/upload-slice'

export default {
  name: 'App',
  components: {
    UploadSlice
  },
  data() {
    return {
      // 上传部分
      uploadInfoSlice: {
        actionChunk: process.env.VUE_APP_BASE_API + '/storage/file/v3/chunk', // 上传路径
        headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJ0ZW5hbnRJZCI6MSwidGVuYW50U2VjcmV0IjpudWxsLCJ1c2VybmFtZSI6IumZiOmUkOeFjCIsInVzZXJJZCI6MTk1NzksInVzZXJQd2QiOm51bGwsInVzZXJKb2JOdW1iZXIiOiIxMTExMSIsInBob25lIjoiMTg4MTkyNTM2NzYiLCJlbWFpbCI6ImNoZW4ucnVpaHVhbmdAaDNjLmNvbSIsInJvbGUiOm51bGwsInJvbGVJZCI6MSwicm9sZU5hbWUiOiLkvIHkuJrnrqHnkIblkZgiLCJyZCI6ZmFsc2UsIm1lbnVzIjpbIjEiLCIyIiwiMTAxIiwiMTAyIiwiMTAzIiwiMjAxIiwiMjAyIiwiMjAzIiwiMjA2IiwiMjEwIiwiMjEyIiwiNCIsIjQwMSIsIjQwMiJdLCJhdXRoVHlwZSI6IkNIT09TRV9URU5BTlQiLCJlbmFibGVkIjp0cnVlLCJwYXNzd29yZCI6bnVsbCwiYXV0aG9yaXRpZXMiOlt7ImF1dGhvcml0eSI6IjEifSx7ImF1dGhvcml0eSI6IjIifSx7ImF1dGhvcml0eSI6IjEwMSJ9LHsiYXV0aG9yaXR5IjoiMTAyIn0seyJhdXRob3JpdHkiOiIxMDMifSx7ImF1dGhvcml0eSI6IjIwMSJ9LHsiYXV0aG9yaXR5IjoiMjAyIn0seyJhdXRob3JpdHkiOiIyMDMifSx7ImF1dGhvcml0eSI6IjIwNiJ9LHsiYXV0aG9yaXR5IjoiMjEwIn0seyJhdXRob3JpdHkiOiIyMTIifSx7ImF1dGhvcml0eSI6IjQifSx7ImF1dGhvcml0eSI6IjQwMSJ9LHsiYXV0aG9yaXR5IjoiNDAyIn0seyJhdXRob3JpdHkiOiJDT01NT05fVVNFUiJ9XSwiYWNjb3VudE5vbkV4cGlyZWQiOnRydWUsImFjY291bnROb25Mb2NrZWQiOnRydWUsImNyZWRlbnRpYWxzTm9uRXhwaXJlZCI6dHJ1ZSwibG9naW5OYW1lIjoi6ZmI6ZSQ54WMIiwiZXhwIjoxNjc4ODY1MDI0fQ.CQN0KBDC7K1EEWgZsbKQKLHJYGrvqBuJVUV70JE8VgQOLuZUE_ncrEloQ8ndloly7aDGLzRjcluyqifvhUwTRQ' }
      }
    }
  },
  methods: {
    // 分片预请求
    async handleUploadPre(file) {
      const form = new FormData()
      form.append('fileSource', 'APPLICATION')
      form.append('originFileName', file.name)
      let res = ''
      try {
        res = await uploadPre(form)
      } catch (error) {
        throw new Error(error)
      }
      // 多文件
      const item = {
        uid: file.uid,
        file: file.raw,
        prepareId: res.msg
      }
      this.progressFileList.push(item)
    },
    // 构造分片参数
    genFormData(chunks, uid) {
      const prepareId = this.getCurrentPrepareId(uid)
      return chunks.map(chunk => {
        const form = new FormData()
        form.append('chunk', chunk.file)
        form.append('uploadId', prepareId)
        form.append('partNumber', chunk.index)
        return form
      })
    },
    // 合并请求
    async handleUploadMerge(file, uid) {
      const prepareId = this.getCurrentPrepareId(uid)
      const form = new FormData()
      form.append('fileSource', 'APPLICATION')
      form.append('hash', prepareId)
      form.append('filename', file.name)
      // return 建议使用, 用于handleSuccess获取数据
      try {
        const res = await uploadMerge(form)
        return res
      } catch (error) {
        return error
      }
    },
    // 判断当前处理prepareId
    getCurrentPrepareId(uid) {
      for (const item of this.progressFileList) {
        if (item.uid === uid) {
          return item.prepareId
        }
      }
    },
    async handleSuccess(res, file, fileList) {
      console.log('res, file, fileList', res, file, fileList)
    },
    handleRemove(file, fileList) {
      // 清空文件
      if (!fileList.length) {
        this.progressFileList = []
      }
      for (const [index, value] of this.progressFileList.entries()) {
        if (file.uid === value.uid) {
          this.progressFileList.splice(index, 1)
          break
        }
      }
    },
    // 取消上传
    handleCancel(file, fileList) {
      console.log('file, fileList', file, fileList)
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  .upload-wrap {
    width: 400px;
    margin: 0 auto;
  }
}
</style>
