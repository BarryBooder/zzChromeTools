// background/messages/store-record.ts
import type { PlasmoMessaging } from "@plasmohq/messaging"

import { pingRecords, type PingRecord } from "../pingRecord"

/** 接收 content-script 发送过来的新埋点，把它存进 pingRecords */
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // body 里就是 content-script 传过来的 PingRecord
  const newRecord = req.body as PingRecord
  // 在顶部插入
  console.log("newRecord", newRecord)
  pingRecords.unshift(newRecord)

  if (req.body === "clear") {
    pingRecords.splice(0, pingRecords.length)
  }

  // 也可以做去重、截断等逻辑
  res.send("ok")
}

export default handler
