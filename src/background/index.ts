import axios from "axios"
import { onMessage } from "webext-bridge/background"

const MAIN_URL = "http://10.238.52.99:3050"

/**
 * 发送请求给 Whistle
 * @param params Whistle.WhistleRuleParamsData
 * @returns Promise<any>
 */
async function changeWhistleRule(params: any) {
  // 这里你原先写好的 axios 请求逻辑
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `http://127.0.0.1:8899/cgi-bin/rules/select`,
    headers: {
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Origin: `${MAIN_URL}`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    },
    data: params
  }

  const response = await axios.request(config)
  return response.data
}

/**
 * 获取 Project 列表
 */
async function getProjectList() {
  const getProjectListResult = await axios.get(`${MAIN_URL}/api/project`)
  return getProjectListResult.data
}

/**
 * 通过 project id 获取下属所有类目
 */
async function getCategoryByProjectId(params: any) {
  const result = await axios.get(
    `${MAIN_URL}/api/category/byProjectId/${params.id}`
  )
  return result.data
}

/**
 * 通过 project name 获取下属所有类目
 */
async function getCategoryByProjectName(params: any) {
  const result = await axios.get(
    `${MAIN_URL}/api/category/byProjectName/?name=${params.data.name}`
  )
  return result.data
}

async function init() {
  const injectedTabs = {}

  /**
   * 这段函数将被注入到“主世界”执行。
   * 只能写成纯函数形式，或外联文件：此处内联更简单。
   */
  function overrideSendBeaconInMain() {
    const originalSendBeacon = navigator.sendBeacon
    navigator.sendBeacon = function (url, data) {
      if (
        typeof url === "string" &&
        url.includes("lego.zhuanzhuan.com/page/mark-p")
      ) {
        // 把埋点请求的url、data通过window.postMessage抛给页面
        window.postMessage({ source: "my-ext-beacon", url, data }, "*")
      }
      return originalSendBeacon.apply(this, arguments)
    }
  }

  /**
   * 注入脚本到指定 tab 的主世界
   */
  async function injectSendBeaconOverride(tabId: number) {
    console.log(
      "[BG] Injecting overrideSendBeaconInMain into tab =>",
      tabId,
      new Date().getTime()
    )
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN", // 主世界
        func: overrideSendBeaconInMain
      })
    } catch (err) {
      console.error("[BG] Failed to inject script =>", err)
    }
  }

  // ================ 监听 tab 更新/激活，注入脚本 ================

  // 1) 当 tab 完整加载完成时
  // ================ 监听 tab 更新/激活，注入脚本 ================
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // 如果没有 URL，直接跳过
    if (!tab.url) return

    // 只针对特定站点，比如包含 zhuanzhuan.com
    const isTargetSite = tab.url.includes("zhuanzhuan.com")

    // 如果是进入 loading 状态 且是我们目标站点
    if (changeInfo.status === "loading" && isTargetSite) {
      // 如果还没注入，则注入
      if (!injectedTabs[tabId]) {
        injectedTabs[tabId] = true
        try {
          await injectSendBeaconOverride(tabId)
        } catch (err) {
          console.error("[BG] Failed to inject script =>", err)
        }
      }
    }

    // 如果是 complete 状态，则把这个 tab 的标记重置
    // 这样下次再刷新还能重新注入
    if (changeInfo.status === "complete") {
      // 无论是不是 zhuanzhuan.com，先删掉都行
      delete injectedTabs[tabId]
    }
  })

  // 2) 当切换 tab 时
  // chrome.tabs.onActivated.addListener((activeInfo) => {
  //   injectSendBeaconOverride(activeInfo.tabId)
  // })

  // 3) 可选：监听安装/更新等事件
  chrome.runtime.onInstalled.addListener(() => {
    console.log("[BG] Extension installed")
  })

  console.log("[BG] Service worker (MV3) loaded!")
}

/**
 *   监听消息：CHANGE_WHISTLE_RULE
 */
onMessage("CHANGE_WHISTLE_RULE", async ({ data }) => {
  try {
    // data 就是你前端传过来的参数
    const result = await changeWhistleRule(data)
    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error("changeWhistleRule error:", error)
    return {
      success: false,
      error: error?.message || "Unknown error"
    }
  }
})

/**
 * 监听消息：GET_PROJECT_LIST
 */
onMessage("GET_PROJECT_LIST", async () => {
  try {
    const result = await getProjectList()
    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error("getProjectList error:", error)
    return {
      success: false,
      error: error?.message || "Unknown error"
    }
  }
})

/**
 * 监听消息 GET_CATEGORY_BY_PROJECT_ID
 */
onMessage("GET_CATEGORY_BY_PROJECT_NAME", async (params) => {
  console.log(111, params)
  try {
    const result = await getCategoryByProjectName(params)
    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error("getCategoryByProjectName error:", error)
    return {
      success: false,
      error: error?.message || "Unknown error"
    }
  }
})

/**
 * 在后台脚本里注册一个消息，用于创建独立弹窗
 */
onMessage("CREATE_FLOATING_WINDOW", async ({ data }) => {
  // 你可以自定义弹窗的尺寸、位置等
  const popupWidth = 500
  const popupHeight = 600

  chrome.windows.create(
    {
      url: chrome.runtime.getURL("floating-window.html"), // 扩展内的页面
      type: "popup",
      width: popupWidth,
      height: popupHeight,
      // left/top 也可以指定定位
      // left: 100,
      // top: 100,
      focused: true
    },
    (createdWindow) => {
      console.log("独立浮窗已创建:", createdWindow)
    }
  )

  return { success: true }
})
