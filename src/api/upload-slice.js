import request from '@/utils/request'

// 预请求
export function uploadPre(data) {
  return request({
    url: '/storage/file/v3/prepare',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data
  })
}

// 合并上传
export function uploadMerge(data) {
  return request({
    url: '/storage/file/v3/merge',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data
  })
}
