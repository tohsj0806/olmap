import axios from 'axios'
class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        //"Authorization": store.state.user.token,
        //"Authorization": "Bearer " + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnQiOnsibG9naW5faWQiOiJ5ZXMiLCJuYW1lIjoi5p2ONjYiLCJkd2RtIjoiMTAwMDIxOTIiLCJkd21jIjoi5YyX5Lqs5biC55-z5pmv5bGx5Yy66YKu56Wo5YWs5Y-4IiwicmlkcyI6WzFdLCJtb2R1bGVzIjpbImNvbXBvbmVudDpsaXN0IiwiY29tcG9uZW50T2ZmZXJSZXZpZXc6ZG8iXSwiZXhwaXJlc0F0IjoxNTg1MjgyNDU5fSwiZXhwIjoxNTg1MjgyNDU5LCJpc3MiOiJianl6In0.dlTyOu8JvLQzV6U_yTu8WRJJ1qlG5ZcArQesRKoD7W0",
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Credentials":true
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() 
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      const { data } = res
      return { data }
    }, error => {
        if (error && error.response) {
          switch (error.response.status) {
              case 400: error.message = '请求错误(400)' ; break;
              case 401: error.message = '未授权，请重新登录(401)'; break;
              case 403: error.message = '拒绝访问(403)'; break;
              case 404: error.message = '请求出错(404)'; break;
              case 408: error.message = '请求超时(408)'; break;
              case 500: error.message = '服务器错误(500)'; break;
              case 501: error.message = '服务未实现(501)'; break;
              case 502: error.message = '网络错误(502)'; break;
              case 503: error.message = '服务不可用(503)'; break;
              case 504: error.message = '网络超时(504)'; break;
              case 505: error.message = 'HTTP版本不受支持(505)'; break;
              default: error.message = `连接出错(${error.response.status})!`;
          }
        
      }else{
        error.message = '服务器正在重启，请您稍等片刻!'
      }
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
