import type { FC } from "react"

import Matching from "~components/Body/components/Matching"
import QrCode from "~components/Body/components/QrCode"
import WhistleChanger from "~components/Body/components/WhistleChanger"

import styles from "./index.module.css"

const Body: FC = () => {
  return (
    <>
      <div>
        <Matching />
        <QrCode />
        <WhistleChanger />
      </div>
    </>
  )
}

export default Body
