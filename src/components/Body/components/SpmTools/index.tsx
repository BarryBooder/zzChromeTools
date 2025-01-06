import { Button, Table, Tag } from "antd"
import { useEffect, useState, type FC } from "react"
import { onMessage, sendMessage } from "webext-bridge/popup"

const SpmTools: FC = () => {
  const handleShowPanel = async () => {
    // sendMessage 的第三个参数可以是 {to: "tabId"}，也可以 broadcast
    // 假设我们只想发给当前活动 Tab:
    await sendMessage("CREATE_FLOATING_WINDOW", "", "background")
  }

  return (
    <div style={{ padding: 8 }}>
      <h1>使用 Ctrl + Shift + M 来打开/关闭埋点面板</h1>
    </div>
  )
}

export default SpmTools
