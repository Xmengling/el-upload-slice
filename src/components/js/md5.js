import sparkMD5 from 'spark-md5'
// 利用window.requestIdleCallback计算文件md5
export function calculateHashIdle(chunks) {
  return new Promise(resolve => {
    const spark = new sparkMD5.ArrayBuffer()
    let count = 0

    const appendToSpark = async file => {
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = e => {
          spark.append(e.target.result)
          resolve()
        }
      })
    }
    const workLoop = async deadline => {
      // timeRemaining获取当前帧的剩余时间
      while (count < chunks.length && deadline.timeRemaining() > 1) {
        // 空闲时间，且有任务
        await appendToSpark(chunks[count].file)
        count++
        if (count >= chunks.length) {
          resolve(spark.end())
        }
      }
      window.requestIdleCallback(workLoop)
    }
    // 浏览器一旦空闲，就会调用workLoop
    window.requestIdleCallback(workLoop)
  })
}
