import { proxy } from "ajax-hook"

console.log("proxy已注入")

proxy({
  //请求发起前进入
  onRequest: (config, handler) => {
    console.log("config,handler", config, handler)
    handler.next(config)
  },
  //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
  onError: (err, handler) => {
    handler.next(err)
  },
  //请求成功后进入
  onResponse: (res, handler) => {
    handler.next(res.response)
  }
})
