import { Segmented, Space } from "antd"
import { useState, type FC } from "react"

import FontsAnalyze from "./components/FontsAnalyze"
import JsonTools from "./components/JsonTools"
import Matching from "./components/Matching"
import QrCode from "./components/QrCode"
import SpmTools from "./components/SpmTools"
import WhistleChanger from "./components/WhistleChanger"

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
          options={["工程/二维码", "埋点", "Whistle", "字体分析", "JSON"]}
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
          {component === "埋点" && <SpmTools />}
          {component === "Whistle" && <WhistleChanger />}
          {component === "字体分析" && <FontsAnalyze />}
          {component === "JSON" && <JsonTools />}
        </div>
      </div>
    </>
  )
}

export default Body
