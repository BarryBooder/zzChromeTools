// background/messages/get-records.ts
import type { PlasmoMessaging } from "@plasmohq/messaging"

import obj from "../configStore"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  res.send(obj.baseConfig)
}

export default handler
