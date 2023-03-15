import axios from 'axios'
import { Message } from 'element-ui'

const successCode = [200, 70002, 20003]

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  withCredentials: true,
  timeout: 1000000
})

service.interceptors.request.use(
  async config => {
    if (!config.headers['Content-Type']) { config.headers['Content-Type'] = 'application/json;charset=UTF-8;' }
    config.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJ0ZW5hbnRJZCI6MSwidGVuYW50U2VjcmV0IjpudWxsLCJ1c2VybmFtZSI6IumZiOmUkOeFjCIsInVzZXJJZCI6MTk1NzksInVzZXJQd2QiOm51bGwsInVzZXJKb2JOdW1iZXIiOiIxMTExMSIsInBob25lIjoiMTg4MTkyNTM2NzYiLCJlbWFpbCI6ImNoZW4ucnVpaHVhbmdAaDNjLmNvbSIsInJvbGUiOm51bGwsInJvbGVJZCI6MSwicm9sZU5hbWUiOiLkvIHkuJrnrqHnkIblkZgiLCJyZCI6ZmFsc2UsIm1lbnVzIjpbIjEiLCIyIiwiMTAxIiwiMTAyIiwiMTAzIiwiMjAxIiwiMjAyIiwiMjAzIiwiMjA2IiwiMjEwIiwiMjEyIiwiNCIsIjQwMSIsIjQwMiJdLCJhdXRoVHlwZSI6IkNIT09TRV9URU5BTlQiLCJlbmFibGVkIjp0cnVlLCJwYXNzd29yZCI6bnVsbCwiYXV0aG9yaXRpZXMiOlt7ImF1dGhvcml0eSI6IjEifSx7ImF1dGhvcml0eSI6IjIifSx7ImF1dGhvcml0eSI6IjEwMSJ9LHsiYXV0aG9yaXR5IjoiMTAyIn0seyJhdXRob3JpdHkiOiIxMDMifSx7ImF1dGhvcml0eSI6IjIwMSJ9LHsiYXV0aG9yaXR5IjoiMjAyIn0seyJhdXRob3JpdHkiOiIyMDMifSx7ImF1dGhvcml0eSI6IjIwNiJ9LHsiYXV0aG9yaXR5IjoiMjEwIn0seyJhdXRob3JpdHkiOiIyMTIifSx7ImF1dGhvcml0eSI6IjQifSx7ImF1dGhvcml0eSI6IjQwMSJ9LHsiYXV0aG9yaXR5IjoiNDAyIn0seyJhdXRob3JpdHkiOiJDT01NT05fVVNFUiJ9XSwiYWNjb3VudE5vbkV4cGlyZWQiOnRydWUsImFjY291bnROb25Mb2NrZWQiOnRydWUsImNyZWRlbnRpYWxzTm9uRXhwaXJlZCI6dHJ1ZSwibG9naW5OYW1lIjoi6ZmI6ZSQ54WMIiwiZXhwIjoxNjc4ODY1MDI0fQ.CQN0KBDC7K1EEWgZsbKQKLHJYGrvqBuJVUV70JE8VgQOLuZUE_ncrEloQ8ndloly7aDGLzRjcluyqifvhUwTRQ'
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
service.interceptors.response.use(
  response => {
    const res = response.data
    if (!successCode.includes(Number(res.resultCode))) {
      Message.closeAll()
      Message({
        message: res.msg,
        type: 'error',
        duration: 3000
      })
      return Promise.reject(res.resultCode + ': ' + res.msg || 'Error')
    } else {
      return res
    }
  },
  error => {
    Message({
      message: '网络异常',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
