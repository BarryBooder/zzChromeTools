// src/contents/mark-p-antd-panel.tsx

import { Table } from "antd"
import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

// 1) Plasmo 配置
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"], // 或者只匹配特定域名
  run_at: "document_start", // 最早阶段
  world: "MAIN" // 主世界可 Monkey Patch
}

/** 定义我们在Table里要展示的字段 */
interface PingRecord {
  /** 拦截时间 */
  time: string
  /** data 中解析到的 pagetype */
  pagetype: string
  /** data 中解析到的 actiontype */
  actiontype: string
  /** data.backup.sectionId */
  sectionId: string
  /** data.backup.sortId */
  sortId: string
  /** data.backup.sortName */
  sortName: string
}

/** 我们的主组件：拦截并显示 mark-p 请求 */
function MarkPPanel() {
  const [rows, setRows] = useState<PingRecord[]>([])

  useEffect(() => {
    // ============ 在 useEffect 里完成 Monkey Patch ============
    const originalSendBeacon = navigator.sendBeacon

    navigator.sendBeacon = function (url: string, data?: BodyInit) {
      if (
        typeof url === "string" &&
        url.includes("lego.zhuanzhuan.com/page/mark-p")
      ) {
        let parsedBody: any
        try {
          // data 可能是字符串，也可能是 Blob/FormData
          // 这里只处理最常见 string -> JSON 的情况
          parsedBody = JSON.parse(typeof data === "string" ? data : "")
        } catch {
          parsedBody = data
        }

        // 从埋点数据里解构想展示的字段
        // 如果其中 backup 可能为空，需要写 ? 或 ||
        const newRecord: PingRecord = {
          time: new Date().toLocaleString(),
          pagetype: parsedBody?.pagetype || "",
          actiontype: parsedBody?.actiontype || "",
          sectionId: parsedBody?.backup?.sectionId || "",
          sortId: parsedBody?.backup?.sortId || "",
          sortName: parsedBody?.backup?.sortName || ""
        }

        // 在顶部插入
        setRows((prev) => [newRecord, ...prev])
      }

      // 调用原生 sendBeacon
      return originalSendBeacon.apply(this, arguments as any)
    }
  }, [])

  // =========== 定义 antd Table 的列 ===========
  const columns = [
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: 160
    },
    {
      title: "pagetype",
      dataIndex: "pagetype",
      key: "pagetype",
      width: 120
    },
    {
      title: "actiontype",
      dataIndex: "actiontype",
      key: "actiontype",
      width: 120
    },
    {
      title: "sectionId",
      dataIndex: "sectionId",
      key: "sectionId",
      width: 90
    },
    {
      title: "sortId",
      dataIndex: "sortId",
      key: "sortId",
      width: 90
    },
    {
      title: "sortName",
      dataIndex: "sortName",
      key: "sortName",
      width: 120
    }
  ]

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 999999,
        maxHeight: "100vh",
        overflow: "auto",
        backgroundColor: "#fff",
        border: "2px solid #333"
      }}>
      <Table
        columns={columns}
        dataSource={rows}
        pagination={false}
        rowKey={(_, idx) => idx.toString()}
        size="small"
        scroll={{ y: 400 }}
      />
    </div>
  )
}

/** 2) 在当前脚本中，创建并挂载 React 根节点 */
function initPanel() {
  // 等 DOM 存在后再插入
  if (!document.body) {
    // 如果在非常早的时机(document_start) body还没出现,
    // 可以稍等一下, 或者用MutationObserver.
    setTimeout(initPanel, 50)
    return
  }

  // 创建一个容器插入到页面
  const rootDiv = document.createElement("div")
  document.body.appendChild(rootDiv)

  // 使用 React 18 的 createRoot
  const root = createRoot(rootDiv)
  root.render(<MarkPPanel />)
}

// 启动
initPanel()
