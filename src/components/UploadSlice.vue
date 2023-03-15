<!--
 * @Description: 二次封装上传组件-切片上传
-->
<template>
  <div class="hub-upload-slice-wrap">
    <el-upload
      ref="hub-upload-slice"
      :disabled="(upLoading && !multiple) || disabled"
      :action="actionMerge"
      :accept="accept"
      :limit="limit"
      :size="size"
      :multiple="multiple"
      :list-type="listType"
      :auto-upload="false"
      :file-list="inFileList"
      :on-change="handleChange"
      :before-upload="handleBeforeUpload"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <!-- 插槽: 触发文件框 -->
      <template v-if="$slots.trigger" slot="trigger">
        <slot name="trigger" />
      </template>

      <!-- 非插槽：默认交互 -->
      <template v-else>
        <!-- 图片上传 -->
        <template v-if="listType === 'picture-card'" class="upload-tips">
          <i class="el-icon-plus" />
        </template>

        <!-- 文件上传: 按钮样式 -->
        <template v-else>
          <!-- 上传前 -->
          <!-- 隐藏按钮： 1.开启隐藏 2.不在预请求期间 3.开启隐藏&&上传中 -->
          <el-button
            v-if="!hideBtn || preLoading || (hideBtn && !upLoading) || multiple"
            slot="trigger"
            type="primary"
            icon="el-icon-upload2"
            :loading="preLoading"
            plain
            style="margin-bottom: 10px;"
            @click="resetUpload"
          >
            {{ isLimit && !upLoading ? '重新上传' : '上传文件' }}
          </el-button>
        </template>
      </template>
    </el-upload>

    <!-- 上传提示 -->
    <!-- 插槽: 提示说明 -->
    <template v-if="$slots.tip">
      <slot name="tip" />
    </template>

    <!-- 非插槽: 默认提示 -->
    <template v-else>
      <div class="upload-tips">
        <span v-if="accept">
          <i class="el-icon-warning" />
          仅支持{{ accept }}格式</span>
        <span v-if="size">
          <span v-if="accept">，</span>
          大小不超过{{ size }}M
        </span>
        <span v-if="limit">
          <span v-if="size">，</span>
          最多上传{{ limit }}个文件</span>
        <span><slot name="more-tips" /></span>
      </div>
    </template>

    <!-- 文件进度条 -->
    <template v-if="listType === 'text'">
      <div v-for="(item, index) in inFileList" :key="index" class="file-info-wrap">
        <div class="file-info">
          <!-- 文件名 -->
          <div class="name">{{ item.name }}</div>
          <div>
            <!-- 进度条 -->
            <div class="progress-text-wrap">
              <div class="name">{{ item.totalProgress || 0 }}%</div>
              <!-- 取消上传 -->
              <div v-if="cancelable" class="cancel" @click="abortFile(item)">
                <i class="el-icon-error" style="color: #909399; font-size: 14px" />
              </div>
            </div>
            <!-- hover icon -->
            <div class="icon-wrap">
              <div v-if="item.totalProgress === 100" class="check">
                <i class="el-icon-circle-check" />
              </div>
              <div v-if="item.totalProgress === 100" class="delete" @click="deleteFile(item)">
                <i class="el-icon-close" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="item.totalProgress<100" class="progress-wrap">
          <div class="progress">
            <el-progress
              :stroke-width="3"
              :percentage="item.totalProgress"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 图片进度条 -->
    <template v-if="listType === 'picture-card'">
      <div v-for="(item, index) in inFileList" :key="index" class="picture-card-file-info-wrap">
        <div class="progress-wrap">
          <el-progress
            v-if="item.totalProgress && item.totalProgress<100"
            type="circle"
            :stroke-width="2"
            :width="50"
            :percentage="item.totalProgress"
          />
          <el-progress
            v-if="item.totalProgress === 100"
            type="circle"
            :percentage="100"
            :stroke-width="2"
            :width="50"
            status="success"
          />
          <div v-if="item.totalProgress === 100" class="delete" @click="deleteFile(item)">
            <i class="el-icon-circle-close" /> 删除
          </div>
        </div>
        <div class="name">{{ item.name }}</div>
      </div>
    </template>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import ajax from './js/ajax'
import { calculateHashIdle } from './js/md5'

export default {
  name: 'HubUploadSlice',
  props: {
    action: {
      type: String,
      default: ''
    },
    actionMerge: {
      type: String,
      default: ''
    },
    // 格式限制
    accept: {
      type: String,
      default: ''
    },
    // 数量限制
    limit: {
      type: Number,
      default: null
    },
    // 大小限制
    size: {
      type: String,
      default: ''
    },
    drag: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    cancelable: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    // 是否在上传过程中隐藏上传按钮
    hideBtn: {
      type: Boolean,
      default: false
    },
    listType: {
      type: String,
      default: 'text'
    },
    onRemove: {
      type: Function,
      default: () => {}
    },
    onSuccess: {
      type: Function,
      default: () => {}
    },
    onError: {
      type: Function,
      default: () => {}
    },
    onProgress: {
      type: Function,
      default: () => {}
    },
    onExceed: {
      type: Function,
      default: () => {}
    },
    onChange: {
      type: Function,
      default: () => {}
    },
    onUploadPre: {
      type: Function,
      default: () => {}
    },
    onUploadMerge: {
      type: Function,
      default: () => {}
    },
    onFormData: {
      type: Function,
      default: () => {}
    },
    onCancel: {
      type: Function,
      default: () => {}
    },
    beforeUpload: {
      type: Function,
      default: () => {}
    },
    fileList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      upLoading: false, // 上传中
      preLoading: false, // 预请求中
      inFileList: [], // 成功列表
      hash: '',
      chunks: [],
      file: '',
      isMerge: ''
    }
  },
  computed: {
    // 是否已达上传数量
    isLimit() {
      // 不限制数量
      if (!this.limit) return false
      return this.limit - this.inFileList.length < 1
    }
  },

  methods: {
    // 上传失败
    handleError(err, file, fileList) {
      Message.error('文件上传失败')
      this.upLoading = false
      this.onError(err, file, fileList)
    },
    // 上传前
    handleBeforeUpload(file) {
      this.upLoading = true
      this.preLoading = true
      this.beforeUpload(file)
      return new Promise((resolve, reject) => {
        // 1. 校验格式
        if (this.accept) {
          const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
          if (!this.accept.split(',').includes('.' + fileType)) {
            Message.closeAll()
            Message.error(`上传文件仅支持 ${this.accept} 格式!`)
            this.upLoading = false
            this.preLoading = false
            reject()
            return
          }
        }
        // 2. 校验大小
        if (this.size) {
          const isOverSize = file.size / 1024 / 1024 > this.size
          if (isOverSize) {
            Message.closeAll()
            Message.error(`文件大小不能超过${this.size}M`)
            this.upLoading = false
            this.preLoading = false
            reject()
            return
          }
        }
        resolve()
      })
    },
    async handleChange(file) {
      this.isMerge = false
      this.upLoading = true
      this.preLoading = true
      // 文件切片
      const chunks = this.genFileChunks(file)
      // 计算文件hash 所有切片hash一致
      let hash = ''
      try {
        hash = await calculateHashIdle(chunks)
      } catch (error) {
        Message.error('文件上传失败')
        return
      }
      file.hash = hash
      // 构造chunks数据
      file.chunks = this._genChunks(chunks)
      // 初始化进度条
      this.inFileList.push(file)
      // 上传切片
      this.uploadChunks(file.uid)
      this.onChange(file, this.inFileList)
    },
    // 文件切片
    genFileChunks(file) {
      const chunks = []
      let cur = 0
      // 小于10M 固定一片
      if (file.size < (10 * 1024 * 1024)) {
        chunks.push({
          index: cur,
          file: file.raw.slice(cur, file.size),
          originFilename: file.name
        })
        return chunks
      }
      // 小于50M 文件10%为一片
      if (file.size < (50 * 1024 * 1024)) {
        const chunkSize = parseInt(file.size * 0.1)
        while (cur < file.size) {
          chunks.push({
            index: cur,
            file: file.raw.slice(cur, cur + chunkSize),
            originFilename: file.name
          })
          cur += chunkSize
        }
        return chunks
      }
      // 大于50M 固定5M 一片
      const chunkSize = parseInt(5 * 1024 * 1024)
      while (cur < file.size) {
        chunks.push({
          index: cur,
          file: file.raw.slice(cur, cur + chunkSize),
          originFilename: file.name
        })
        cur += chunkSize
      }
      return chunks
    },

    // 构造切片数据
    _genChunks(chunks, uploadedList) {
      return chunks.map((c, index) => {
        // hash+序号，作为切片名称
        const name = this.hash + '_' + index
        return {
          hash: this.hash,
          name,
          index,
          originFilename: c.originFilename,
          file: c.file,
          progress: uploadedList
            ? uploadedList.indexOf(name) !== -1
              ? 100
              : 0
            : 0
        }
      })
    },
    // 上传切片
    async uploadChunks(uid) {
      // 预请求
      await this.preRequest(uid)
      // 上传切片
      const requests = this._genRequest(this._genUploadData(uid), uid)
      await this.sendRequest(requests)
      // await Promise.all(requests)
      // 请求合并
      this.mergeRequest(uid)
    },
    async preRequest(uid) {
      const file = this.getCurrentFile(uid)
      try {
        const res = await this.onUploadPre(file)
        this.preLoading = false
        return res
      } catch (error) {
        for (const [index, item] of this.inFileList.entries()) {
          if (uid === item.uid) {
            this.inFileList.splice(index, 1)
            break
          }
        }
        this.upLoading = false
        this.preLoading = false
      }
    },
    // 生成调用请求：[Promise, Promise]
    _genRequest(uploadData, uid) {
      const file = this.getCurrentFile(uid)
      const chunks = this.getCurrentChunks(uid)
      return uploadData.map(({ form, index }) => {
        const options = {
          headers: this.$attrs.headers,
          file: file,
          data: form,
          action: this.action,
          onProgress: progress => {
            chunks[index].progress = Number(
              ((progress.loaded / progress.total) * 100).toFixed(2)
            )
            this.handleProgress(progress, file, uid)
          }
        }
        return options
      })
    },
    // 生成上传数据：[{form, index, error}, {form, index, error}]
    _genUploadData(uid) {
      const chunks = this.getCurrentChunks(uid)
      return this.onFormData(chunks, uid)
    },
    // 切片发送完成，发送合并请求
    async mergeRequest(uid) {
      const file = this.getCurrentFile(uid)
      if (file.status === 'cancel') {
        for (const [index, item] of this.inFileList.entries()) {
          if (file.uid === item.uid) {
            this.inFileList.splice(index, 1)
            break
          }
        }
        return
      }
      const res = await this.onUploadMerge(file, uid)
      file.status = 'success'
      this.handleSuccess(res, file, this.inFileList, uid)
      this.isMerge = true
      // 更新进度
      this.countProgress(uid)
    },
    // 判断当前处理file
    getCurrentFile(uid) {
      for (const item of this.inFileList) {
        if (item.uid === uid) {
          return item
        }
      }
    },
    // 判断当前处理chunks
    getCurrentChunks(uid) {
      for (const item of this.inFileList) {
        if (item.uid === uid) {
          return item.chunks
        }
      }
    },
    // 上传进度
    handleProgress(event, file, uid) {
      this.countProgress(uid)
      this.onProgress(event, file, this.inFileList)
    },
    // 计算进度
    countProgress(uid) {
      this.inFileList.forEach((item, index) => {
        if (item.uid === uid) {
          const file = this.getCurrentFile(uid)
          const chunks = this.getCurrentChunks(uid)
          if (!file || chunks.length === 0) {
            return 0
          }
          let loaded = chunks
            .map(item => {
              return (item.file.size * item.progress) / 100
            })
            .reduce((acc, cur) => acc + cur, 0)
          // merge请求未完成 则进度卡在99%
          if (this.isMerge) loaded = loaded + 1
          const progress = parseInt(loaded * 100 / (file.size + 1))
          this.$set(this.inFileList[index], 'totalProgress', progress)
        }
      })
    },
    // 超出数量
    handleExceed(files, fileList) {
      Message.error(`最多支持上传${this.limit}个文件`)
      this.upLoading = false
      this.preLoading = false
      this.onExceed(files, fileList)
    },
    // 上传成功
    handleSuccess(res, file, inFileList) {
      this.upLoading = false
      this.preLoading = false
      // 上传报错，删除当前文件
      if (Number(res.resultCode) !== 200) {
        for (const [index, item] of this.inFileList.entries()) {
          if (file.uid === item.uid) {
            this.inFileList.splice(index, 1)
            break
          }
        }
        return
      }
      this.onSuccess(res, file, inFileList)
    },
    // 删除操作
    handleRemove(file, inFileList) {
      this.inFileList = inFileList
      this.onRemove(file, inFileList)
    },
    // 清空事件
    clearFiles() {
      this.$refs['hub-upload-slice'].clearFiles()
    },
    // 取消上传
    abortFile(file) {
      file.status = 'cancel' // 标记取消，不发送剩下的chunk 和 merge请求
      Message.info('已取消上传！')
      this.upLoading = false
      this.deleteFile(file)
      this.onCancel(file, this.inFileList)
    },
    // 手动上传文件列表
    submit(file) {
      this.$refs['hub-upload-slice'].submit(file)
    },
    // 重新上传
    resetUpload() {
      if (this.limit - this.inFileList.length === 0) {
        this.$refs['hub-upload-slice'].clearFiles()
        this.inFileList = []
        this.handleRemove('', this.inFileList)
      }
    },
    // 删除文件
    deleteFile(item) {
      for (const [index, value] of this.inFileList.entries()) {
        console.log('item.uid === value.uid', item.uid === value.uid)
        if (item.uid === value.uid) {
          this.inFileList.splice(index, 1)
          this.handleRemove(item, this.inFileList)
        }
      }
    },
    sendRequest(requests, limit = 3) {
      return new Promise((resolve, reject) => {
        const len = requests.length
        let counter = 0
        let isTips = false // 只提示一次失败
        let isStop = false // 如果一个片段失败超过三次 认为当前网洛有问题 停止全部上传
        const startRequest = async() => {
          if (isStop) return
          const task = requests.shift()
          if (task && task.file.status !== 'cancel') {
            // 利用try...catch捕获错误
            try {
              // 具体的接口  抽离出去了
              await ajax(task)
              if (counter === len - 1) { // 最后一个任务
                resolve()
              } else { // 否则接着执行
                counter++
                startRequest() // 启动下一个任务
              }
            } catch (error) {
              // 网络异常
              if (error === 'NETWORK_ERROR' && !isTips) {
                Message.error('网络异常，文件上传失败')
                this.upLoading = false
                this.preLoading = false
                isTips = true
                this.handleRemove('', [])
              }

              // 接口报错重试，限制为3次
              if (task.error < 3) {
                task.error++
                requests.unshift(task)
                startRequest()
              } else {
                isStop = true
                reject(error)
              }
            }
          }
        }
        // 启动任务
        while (limit > 0) {
          // 模拟不同大小启动
          setTimeout(() => {
            startRequest()
          }, Math.random() * 2000)
          limit--
        }
      })
    }
  }
}
</script>

<style lang="scss">
.hub-upload-slice-wrap {
  .progress {
    width: 100% !important;
  }
  .el-progress-bar {
    display: block;
    padding-right: 0;
  }
  .el-progress__text {
    display: none;
  }
}
</style>

<style lang="scss" scoped>
.hub-upload-slice-wrap {
  font-size: 12px;
  .upload-tips {
    margin-top: 10px;
    margin-left: 5px;
    color:#B5B8C5;
  }
  .file-info-wrap {
    height: 38px;
    .file-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 25px;
      padding:5px 10px 5px 0;
      border-radius: 4px;
      .progress-text-wrap {
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 50px;
        color: #666;
      }
      .icon-wrap {
        display: flex;
        justify-content: right;
      }
      &:hover {
        background-color: #f4f7fa;
      }
      &:hover .delete {
        display: block;
        float: right;
      }
      &:hover .check {
        display: none;
      }
      .name {
        line-height: 12px;
        overflow:hidden; //超出的文本隐藏
        text-overflow:ellipsis; //溢出用省略号显示
        white-space:nowrap; //溢出不换行
      }
      .delete {
        display: none;
      }
      .check {
        color: #67c23a;
        float: right;
      }
    }
  }
}
</style>
