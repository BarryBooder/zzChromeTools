// contents/markP.ts

import type { PlasmoCSConfig } from "plasmo"
import { v4 } from "uuid"

import { sendToBackground } from "@plasmohq/messaging"

/**
 * 让Plasmo把它当作Content Script打包
 */
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start" // 避免“runtime not available”
  // 缺省 world => "ISOLATED"
}

// 定义埋点结构
interface PingRecord {
  id: string
  time: string
  pagetype: string
  actiontype: string
  sectionId: string
  sortId: string
  sortName: string
  fullData: any
}

console.log("[MarkP] Content script loaded (ISOLATED)")

// 1) 监听 window.postMessage
window.addEventListener("message", (ev) => {
  // 只处理我们注入脚本发送的消息
  if (!ev.data || ev.data.source !== "my-ext-beacon") {
    return
  }

  const { url, data } = ev.data

  // 解析 data
  let parsedBody: any
  try {
    parsedBody = JSON.parse(typeof data === "string" ? data : "")
  } catch {
    parsedBody = data
  }

  // 组装一个 PingRecord
  const newRecord: PingRecord = {
    id: v4(),
    time: new Date().toLocaleTimeString(),
    pagetype: parsedBody?.pagetype || "",
    actiontype: parsedBody?.actiontype || "",
    sectionId: parsedBody?.backup?.sectionId || "",
    sortId: parsedBody?.backup?.sortId || "",
    sortName: parsedBody?.backup?.sortName || "",
    fullData: parsedBody
  }

  // 把记录发给 background
  sendToBackground({
    name: "store-record",
    body: newRecord
  })
})
