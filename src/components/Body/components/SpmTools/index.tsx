import { Button, Table, Tag } from "antd"
import { useEffect, useState, type FC } from "react"
import { onMessage, sendMessage } from "webext-bridge/popup"

const SpmTools: FC = () => {
  return (
    <div style={{ padding: 8 }}>
      <h1>使用 Ctrl + Shift + M 来打开/关闭埋点面板</h1>
    </div>
  )
}

export default SpmTools
