import { Card, Col, QRCode, Row } from "antd"
import React, { useEffect, useState, type FC } from "react"

const QrCode: FC = () => {
  const [url, setUrl] = useState<string>("")

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        return
      }

      const url = tabs[0].url || ""
      setUrl(url)
    })
  }, [])

  return (
    url && (
      <Card title="当前页面二维码" size="small">
        {url && (
          <Row>
            <Col span={10}>
              <QRCode value={url} />
            </Col>
            <Col span={14}>
              <div style={{ wordBreak: "break-all" }}>{url}</div>
            </Col>
          </Row>
        )}
      </Card>
    )
  )
}

export default QrCode
