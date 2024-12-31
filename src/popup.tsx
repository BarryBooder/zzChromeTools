import Body from "~src/components/Body"
import Header from "~src/components/Header"

import styles from "../popup.module.css"

function IndexPopup() {
  return (
    <div className={styles.container}>
      <Header />
      <Body />
    </div>
  )
}

export default IndexPopup
