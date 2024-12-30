import { Segmented, Space } from "antd"
import { useState, type FC } from "react"

import Matching from "~components/Body/components/Matching"
import QrCode from "~components/Body/components/QrCode"
import SpmTools from "~components/Body/components/SpmTools"
import WhistleChanger from "~components/Body/components/WhistleChanger"

import styles from "./index.module.css"

const Body: FC = () => {
  const [component, setComponent] = useState<string>("工程/二维码")

  const handleTypeChange = (value: string) => {
    setComponent(value)
  }

  return (
    <>
      <div>
        <Segmented
          block
          value={component}
          onChange={handleTypeChange}
          options={["工程/二维码", "埋点工具", "Whistle工具"]}
          style={{ marginBottom: 8 }}
        />
        <div className={styles.body}>
          {component === "工程/二维码" && (
            <>
              <Matching />
              <div style={{ height: 8 }} />
              <QrCode />
            </>
          )}
          {component === "埋点工具" && <SpmTools />}
          {component === "Whistle工具" && <WhistleChanger />}
        </div>
      </div>
    </>
  )
}

export default Body
