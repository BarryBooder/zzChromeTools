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

/**
 *  监听消息：CHANGE_WHISTLE_RULE
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

// 监听Content Script发来的消息
onMessage("FETCH_DATA", async ({ data, sender }) => {
  console.log("[Background] Received fetch data:", data, "from:", sender)
  // 你可以做更多处理，比如存储、或者再发给Popup
  // return 给 content-script 的结果
  return { success: true }
})

onMessage("XHR_DATA", async ({ data, sender }) => {
  console.log("[Background] Received XHR data:", data, "from:", sender)
  return { success: true }
})
