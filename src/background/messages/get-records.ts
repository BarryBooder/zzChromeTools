// background/messages/get-records.ts
import type { PlasmoMessaging } from "@plasmohq/messaging"

import { pingRecords } from "../pingRecord"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // 直接把内存中保存的埋点列表返回
  res.send(pingRecords)
}

export default handler
