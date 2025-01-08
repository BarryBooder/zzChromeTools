import { Button, Table } from "antd"
import type { ColumnFilterItem } from "antd/es/table/interface"
import dayjs from "dayjs"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetRootContainer
} from "plasmo"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { v4 } from "uuid"
import { sendMessage } from "webext-bridge/content-script"

// 1) Plasmo 配置
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
  world: "MAIN"
}

export const getRootContainer = () => document.querySelector("body")

/** 定义我们在Table里要展示的字段 */
interface PingRecord {
  id: string
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
export default function MarkPPanel() {
  const [rows, setRows] = useState<PingRecord[]>([])
  const [isShowPanel, setIsShowPanel] = useState(false)
  const [sectionIdFilter, setSectionIdFilter] = useState<ColumnFilterItem[]>([])
  const [isBodyReady, setIsBodyReady] = useState(false)

  useEffect(() => {
    if (document?.body) {
      setIsBodyReady(true)
    }
  }, [])

  sendMessage("qqq", "", "background")

  useEffect(() => {
    // 全局按键切换面板展示
    const handleKeyDown = (e: KeyboardEvent) => {
      // 例如用 Ctrl + Shift + M 作为快捷键
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") {
        setIsShowPanel((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
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
          id: v4(),
          time: dayjs().format("HH:mm:ss"),
          pagetype: parsedBody?.pagetype || "",
          actiontype: parsedBody?.actiontype || "",
          sectionId: parsedBody?.backup?.sectionId || "",
          sortId: parsedBody?.backup?.sortId || "",
          sortName: parsedBody?.backup?.sortName || ""
        }

        // 在顶部插入
        setRows((prev) => [newRecord, ...prev])
        setSectionIdFilter((prev) => {
          // 确保新值唯一
          const updatedFilters = [
            { text: newRecord.sectionId, value: newRecord.sectionId },
            ...prev.filter(
              (item) => Number(item.value) !== Number(newRecord.sectionId)
            )
          ]

          // 排序
          return updatedFilters.sort(
            (a, b) => Number(a.value) - Number(b.value)
          )
        })
      }

      // 调用原生 sendBeacon
      return originalSendBeacon.apply(this, arguments as any)
    }
  }, [])

  // =========== 定义 antd Table 的列 ===========
  const columns = [
    {
      title: "pagetype",
      dataIndex: "pagetype",
      key: "pagetype",
      filters: [
        {
          text: "Areaexposure",
          value: "Areaexposure"
        },
        {
          text: "explosureGoods",
          value: "explosureGoods"
        },
        {
          text: "ZHUANZHUANM",
          value: "ZHUANZHUANM"
        },
        {
          text: "ab_event",
          value: "ab_event"
        },
        {
          text: "zpmclick",
          value: "zpmclick"
        }
      ],
      onFilter: (value: string, record: PingRecord) =>
        record.pagetype.indexOf(value as string) === 0
    },
    {
      title: "actiontype",
      dataIndex: "actiontype",
      key: "actiontype"
    },
    {
      title: "sectionId",
      dataIndex: "sectionId",
      key: "sectionId",
      filters: sectionIdFilter || [],
      onFilter: (value: string, record: PingRecord) => {
        return parseInt(record.sectionId, 10) === Number(value)
      }
    },
    {
      title: "sortId",
      dataIndex: "sortId",
      key: "sortId"
    },
    {
      title: "sortName",
      dataIndex: "sortName",
      key: "sortName"
    }
  ]

  if (!isBodyReady) {
    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 1049,
        maxHeight: 300,
        overflow: "auto",
        backgroundColor: "#fff",
        border: "2px solid #333",
        maxWidth: "100%"
      }}>
      <Table
        columns={columns}
        dataSource={rows}
        pagination={false}
        style={{ display: isShowPanel ? "block" : "none" }}
        rowKey={(record) => record.id}
        size="small"
        scroll={{ y: 400 }}
      />
    </div>
  )
}

/** 2) 在当前脚本中，创建并挂载 React 根节点 */
function initPanel() {
  if (document.body) {
    insertPanel()
    return
  }

  const observer = new MutationObserver(() => {
    if (document.body) {
      observer.disconnect() // 停止观察
      insertPanel()
    }
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  })
}

function insertPanel() {
  if (!document.body) {
    console.error("document.body is null, unable to appendChild.")
    return
  }

  const rootDiv = document.createElement("div")
  document.body.appendChild(rootDiv)

  const root = createRoot(rootDiv)
  root.render(<MarkPPanel />)
}

// 启动
initPanel()
