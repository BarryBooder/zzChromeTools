import axios from "axios"

export const openWindow = (url: string) => {
  console.log({ url })
  chrome.tabs.create({ url }) // 使用 Chrome API 打开新标签页
}

// todo：因跨域问题，后续用中间服务器代理
export const fetchData = async () => {
  let data = JSON.stringify({
    param:
      '{"pageIndex":1,"pageSize":16,"filterItems":{},"secondFrom":"","initFrom":"2_7_17823_0","channelPageName":"wristwatch","tab":0,"rstmark":1734428167783,"labelIdList":"","firstSearchFeed":1}'
  })
  const res = await axios.post(
    "https://app.zhuanzhuan.com/zzopen/ypmall/listData",
    data
  )
  return res.data
}
