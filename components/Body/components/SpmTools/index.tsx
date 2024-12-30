import { Button, Table, Tag } from "antd"
import { useEffect, useState, type FC } from "react"
import { onMessage } from "webext-bridge/popup"

interface TrackingData {
  key: string
  timestamp: number
  actionType: string
  pageType: string
  appId: string
  [key: string]: any
}

const SpmTools: FC = () => {
  const [data, setData] = useState<TrackingData[]>([])

  // 定义表格列
  const columns = [
    {
      title: "时间戳",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text: number) => new Date(text).toLocaleString()
    },
    {
      title: "页面类型",
      dataIndex: "pageType",
      key: "pageType"
    },
    {
      title: "动作类型",
      dataIndex: "actionType",
      key: "actionType"
    },
    {
      title: "App ID",
      dataIndex: "appId",
      key: "appId",
      render: (text: string) => (
        <Tag color="blue" key={text}>
          {text}
        </Tag>
      )
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: TrackingData) => (
        <Button
          type="link"
          onClick={() => {
            alert(`详细信息：\n${JSON.stringify(record, null, 2)}`)
          }}>
          查看详情
        </Button>
      )
    }
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 5 }}
      bordered
    />
  )
}

export default SpmTools
