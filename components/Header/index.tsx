import { Button } from "antd"
import type { FC } from "react"

import { openWindow } from "~components/Body/components/Matching/utils"

import styles from "./index.module.css"

const Header: FC = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.title}>zzChromeTools</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className={styles.version}>V0.0.1</div>
          <div
            onClick={() => openWindow("http://10.238.52.99:8000")}
            style={{ cursor: "pointer" }}>
            管理中心
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
