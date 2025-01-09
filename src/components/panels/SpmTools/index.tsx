// components/panels/SpmTools/index.tsx
import { Button, message, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import type { ColumnFilterItem } from "antd/es/table/interface"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
// 引入 react-syntax-highlighter 相关组件
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
// 你可以选择不同的主题样式，比如 "dark"、"tomorrow"、"coy" 等
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism"

import { sendToBackground } from "@plasmohq/messaging"

interface PingRecord {
  id: string
  time: string
  pagetype: string
  actiontype: string
  sectionId: string
  sortId: string
  sortName: string
}

const SpmToolsPanel = () => {
  const [records, setRecords] = useState<PingRecord[]>([])
  const [sectionIdFilter, setSectionIdFilter] = useState<ColumnFilterItem[]>([])
  const [pageTypeFilter, setPageTypeFilter] = useState<ColumnFilterItem[]>([])
  const [isSpmMonitorOpen, setIsSpmMonitorOpen] = useState(false)
  const [isInjectSpmScriptNextRefresh, setIsInjectSpmScriptNextRefresh] =
    useState()
  const [tab, setTab] = useState<chrome.tabs.Tab>()
  const [isZzTab, setIsZzTab] = useState(false)

  const getTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })
    return tab
  }

  useEffect(() => {
    getTab().then((tab) => {
      setTab(tab)
      if (tab.url.includes("zhuanzhuan.com")) {
        setIsZzTab(true)
      }
    })
  }, [])

  const columns: ColumnsType<PingRecord> = [
    // { title: "Time", dataIndex: "time", key: "time" },
    {
      title: "Pagetype",
      dataIndex: "pagetype",
      key: "pagetype",
      width: 150,
      filters: pageTypeFilter || [],
      onFilter: (value: string, record: PingRecord) =>
        record.pagetype.indexOf(value as string) === 0
    },
    {
      title: "Actiontype",
      dataIndex: "actiontype",
      key: "actiontype",
      width: 90
    },
    {
      title: "SectionId",
      dataIndex: "sectionId",
      key: "sectionId",
      width: 90,
      filterSearch: true,
      filters: sectionIdFilter || [],
      onFilter: (value: string, record: PingRecord) => {
        return parseInt(record.sectionId, 10) === Number(value)
      }
    },
    { title: "SortId", dataIndex: "sortId", key: "sortId", width: 80 },
    { title: "SortName", dataIndex: "sortName", key: "sortName", width: 90 },
    {
      title: "fullData",
      dataIndex: "fullData",
      key: "fullData",
      width: 500,
      render: (fullData: any) => {
        const { backup } = fullData
        try {
          const parsedJson =
            typeof backup === "string" ? JSON.parse(backup) : backup
          const formattedJson = JSON.stringify(parsedJson, null, 2)

          return (
            <SyntaxHighlighter language="json" style={coy}>
              {formattedJson}
            </SyntaxHighlighter>
          )
        } catch (error) {
          return <span>{backup}</span>
        }
      }
    }
  ]

  useEffect(() => {
    let intervalId: number

    function fetchRecords() {
      sendToBackground<PingRecord[]>({
        name: "get-records"
      }).then((res) => {
        if (Array.isArray(res)) {
          setRecords(res)
          setSectionIdFilter(
            res
              .map((record) => record.sectionId)
              .filter((value, index, self) => self.indexOf(value) === index)
              .sort((a, b) => +a - +b)
              .map((value) => ({
                text: value,
                value: value
              }))
          )
          setPageTypeFilter(
            res
              .map((record) => record.pagetype)
              .filter((value, index, self) => self.indexOf(value) === index)
              .map((value) => ({
                text: value,
                value: value
              }))
          )
        }
      })

      sendToBackground<any>({
        name: "get-base-config"
      }).then((res) => {
        setIsInjectSpmScriptNextRefresh(res.injectSpmScriptOnNextRefresh)
      })

      chrome.devtools.inspectedWindow.eval(
        "window.__is_spm_monitor_open__",
        (result: boolean, isException) => {
          if (isException) {
            console.error("Error evaluating script:", isException)
          } else {
            console.log("is_spm_monitor_open__:", result)
            setIsSpmMonitorOpen(result)
          }
        }
      )
    }

    // 先拉一次
    fetchRecords()

    intervalId = window.setInterval(() => {
      fetchRecords()
    }, 800)

    // 组件卸载时清理定时器
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const clearData = async () => {
    // 清空数据
    sendToBackground({
      name: "store-record",
      body: "clear"
    })
  }

  function overrideSendBeaconInMain() {
    const originalSendBeacon = navigator.sendBeacon
    navigator.sendBeacon = function (url, data) {
      if (
        typeof url === "string" &&
        url.includes("lego.zhuanzhuan.com/page/mark-p")
      ) {
        // 把埋点请求的url、data通过window.postMessage抛给页面
        window.postMessage({ source: "my-ext-beacon", url, data }, "*")
      }
      return originalSendBeacon.apply(this, arguments)
    }
  }

  const injectSendBeaconOverride = async () => {
    console.log(
      "[BG] Injecting overrideSendBeaconInMain into tab =>",
      tab.id,
      isZzTab,
      new Date().getTime()
    )
    if (!isZzTab) {
      message.warning("非 *.zhuanzhaun.com/* 页面，注入已取消")
      return
    }
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id as number },
        world: "MAIN", // 主世界
        func: overrideSendBeaconInMain
      })
      chrome.devtools.inspectedWindow.eval(
        "window.__is_spm_monitor_open__ = true;",
        (result, isException) => {
          if (isException) {
            console.error("Error writing to window:", isException)
          } else {
            console.log("Value written to window:", result)
          }
        }
      )
    } catch (err) {
      console.error("[BG] Failed to inject script =>", err)
    }
  }

  const setBaseConfigInjectSpmScriptOnNextRefresh = async () => {
    sendToBackground({
      name: "store-base-config",
      body: {
        injectSpmScriptOnNextRefresh: true
      }
    })
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <h2>埋点检查工具</h2>
        {!isZzTab && (
          <div style={{ color: "red" }}>
            非 *.zhuanzhuan.com/* 页面，工具未启用
          </div>
        )}
        {isInjectSpmScriptNextRefresh && (
          <div style={{ color: "red" }}>注意：将在下一次刷新就注入监控脚本</div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isSpmMonitorOpen ? (
            <small style={{ color: "green" }}>监控已开启</small>
          ) : (
            <small style={{ color: "red" }}>监控未开启</small>
          )}
          <Button
            onClick={injectSendBeaconOverride}
            type={"primary"}
            disabled={isSpmMonitorOpen || !isZzTab}>
            开启监控
          </Button>
          <Button
            onClick={setBaseConfigInjectSpmScriptOnNextRefresh}
            type={"primary"}
            disabled={isInjectSpmScriptNextRefresh || !isZzTab}
            danger>
            在下一次页面刷新时注入脚本
          </Button>
          <Button onClick={clearData} disabled={!records.length}>
            清空数据
          </Button>
        </div>
      </div>
      <Table
        dataSource={records}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </div>
  )
}

const container = document.getElementById("root")
if (container) {
  const root = createRoot(container)
  root.render(<SpmToolsPanel />)
}
