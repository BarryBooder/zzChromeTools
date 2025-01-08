// background/messages/store-record.ts
import type { PlasmoMessaging } from "@plasmohq/messaging"

import obj from "../configStore"

/** 接收 content-script 发送过来的新埋点，把它存进 pingRecords */
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const newRecord = req.body

  obj.baseConfig = { ...obj.baseConfig, ...newRecord }

  // 也可以做去重、截断等逻辑
  res.send("ok")
}

export default handler
