import { Button } from "antd"
import type { FC } from "react"

import { openWindow } from "~src/components/Body/components/Matching/utils"

import styles from "./index.module.css"

const updateLog = `
2024.12.31（V1.0.1）：新增字体分析、JSON 工具，JSON 工具目前支持对 JSON 原文进行【字段/字段值搜索】，可以从复杂的 JSON 原文中快速获取字段/字段值级联关系
2024.12.28（V1.0.0）：新增工程/二维码工具栏，为工程添加类型筛选，添加搜索框
`

const Header: FC = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.title}>zzChromeTools</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            onClick={() => openWindow("http://10.238.52.99:8000")}
            style={{ cursor: "pointer" }}>
            管理中心
          </div>
          <div onClick={() => alert(updateLog)} style={{ cursor: "pointer" }}>
            更新日志
          </div>
          <div className={styles.version}>V1.0.1</div>
        </div>
      </div>
    </>
  )
}

export default Header
