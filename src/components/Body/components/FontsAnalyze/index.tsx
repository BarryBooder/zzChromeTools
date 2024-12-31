import { Button, message, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import React, { useState, type FC } from "react"

type FontInfo = {
  fontFamily: string
  classNames: string[]
}

const FontsAnalyze: FC = () => {
  const [fontData, setFontData] = useState<FontInfo[]>([])
  const [errorMessage, setErrorMessage] = useState()

  const columns: ColumnsType<FontInfo> = [
    {
      title: "字体",
      dataIndex: "fontFamily",
      key: "fontFamily"
    },
    {
      title: "类名",
      dataIndex: "classNames",
      key: "classNames",
      render: (classNames: string[]) => classNames.join(", ")
    }
  ]

  const handleAnalyzeFonts = async () => {
    setErrorMessage(null)
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id as number },
        func: () => {
          const fontMap = new Map<string, Set<string>>()
          const allElements = document.querySelectorAll("*")

          allElements.forEach((el) => {
            const style = window.getComputedStyle(el)
            const fontFamily = style.fontFamily
            if (fontFamily) {
              const className = el.className || "N/A"
              if (!fontMap.has(fontFamily)) {
                fontMap.set(fontFamily, new Set())
              }
              fontMap.get(fontFamily)?.add(className)
            }
          })

          const result: FontInfo[] = []
          fontMap.forEach((classNames, fontFamily) => {
            result.push({
              fontFamily,
              classNames: Array.from(classNames)
            })
          })

          console.log("Font Map:", result)
          return result
        }
      })

      if (injectionResults && injectionResults.length > 0) {
        setFontData(injectionResults[0].result as FontInfo[])
      }
    } catch (error) {
      message.error("字体分析出错：" + error.message)
      setErrorMessage(error.message)
      console.error("字体分析出错：", error)
    }
  }

  return (
    <div style={{ padding: 16, minWidth: 300 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Button onClick={handleAnalyzeFonts}>点击开始分析</Button>
        {errorMessage && (
          <div style={{ color: "red" }}>分析出错：{errorMessage}</div>
        )}
      </div>
      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={fontData.map((item, idx) => ({
          key: idx,
          ...item
        }))}
        pagination={false}
      />
    </div>
  )
}

export default FontsAnalyze
