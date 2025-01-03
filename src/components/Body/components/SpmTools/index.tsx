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
    <div style={{ padding: 8, width: 300 }}>
      <h3>Intercepted Requests</h3>
      <div>
        <button onClick={handleShowPanel}>显示拦截面板</button>
      </div>
    </div>
  )
}

export default SpmTools
