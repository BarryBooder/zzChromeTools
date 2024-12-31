import { Button, Table, Tag } from "antd"
import { useEffect, useState, type FC } from "react"
import { onMessage } from "webext-bridge/popup"

const SpmTools: FC = () => {
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    // 监听 background 转发或 content-script 直接发到 popup 的数据
    // 例如 if content-script => sendMessage("FETCH_DATA", detail, { to: 'popup' })
    // 或 background => sendMessage("FETCH_DATA_TO_POPUP", detail, { to: 'popup' })
    const unsub1 = onMessage("FETCH_DATA", ({ data }) => {
      setRequests((prev) => [...prev, data])
    })
    const unsub2 = onMessage("XHR_DATA", ({ data }) => {
      setRequests((prev) => [...prev, data])
    })
    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  return (
    <div style={{ padding: 8, width: 300 }}>
      <h3>Intercepted Requests</h3>
      {requests.map((req, i) => (
        <div key={i} style={{ border: "1px solid #ccc", marginBottom: 6 }}>
          <div>Method: {req.method}</div>
          <div>URL: {req.url}</div>
          <div>Body: {req.body}</div>
        </div>
      ))}
    </div>
  )
}

export default SpmTools
