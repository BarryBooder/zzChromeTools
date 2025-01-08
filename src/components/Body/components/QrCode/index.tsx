import { Button, Card, Col, QRCode, Row } from "antd"
import React, { useEffect, useState, type FC } from "react"

const MIN_SIZE = 48
const MAX_SIZE = 300

const QrCode: FC = () => {
  const [url, setUrl] = useState<string>("")
  const [size, setSize] = useState<number>(200)
  const [isShowUrl, setIsShowUrl] = useState(false)

  const increase = () => {
    setSize((prevSize) => {
      const newSize = prevSize + 10
      if (newSize >= MAX_SIZE) {
        return MAX_SIZE
      }
      return newSize
    })
  }

  const decline = () => {
    setSize((prevSize) => {
      const newSize = prevSize - 10
      if (newSize <= MIN_SIZE) {
        return MIN_SIZE
      }
      return newSize
    })
  }

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
      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
            <div>当前页面二维码</div>
            <Button.Group>
              <Button onClick={decline} disabled={size <= MIN_SIZE}>
                减小尺寸
              </Button>
              <Button onClick={increase} disabled={size >= MAX_SIZE}>
                加大尺寸
              </Button>
              <Button onClick={() => setIsShowUrl((prevState) => !prevState)}>
                显示/关闭 URL
              </Button>
            </Button.Group>
          </div>
        }
        size="small">
        {url && (
          <>
            <Row>
              <Col span={10}>
                <QRCode
                  value={url}
                  errorLevel="H"
                  size={size}
                  iconSize={size / 4}
                />
              </Col>
              {isShowUrl && (
                <Col span={14}>
                  <div style={{ wordBreak: "break-all" }}>{url}</div>
                </Col>
              )}
            </Row>
          </>
        )}
      </Card>
    )
  )
}

export default QrCode
