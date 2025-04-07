import { useLocalStorageState } from "ahooks"
import { useEffect, type FC } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { openWindow } from "../Body/components/Matching/utils"
import styles from "./index.module.css"

const updateLog = `
2025.02.28（V1.0.6）：新增远程服务器配置项，现在可以自由配置远程服务器的地址了
2025.01.14（V1.0.5）：埋点工具新增始终在页面刷新时注入脚本和刷新时自动清空监控数据的功能
2025.01.09（V1.0.4）：埋点监控工具提供筛选功能，并可以在页面加载前注入脚本，实现全埋点拦截
2025.01.08（V1.0.3）：将埋点监控工具移至控制台，调整注入方式，二维码工具提供增大/减小尺寸，以方便密集二维码加大展示
2025.01.06（V1.0.2）：新增埋点监控工具，可以快捷查看埋点拦截，方便前端进行埋点验证
2024.12.31（V1.0.1）：新增字体分析、JSON 工具，JSON 工具目前支持对 JSON 原文进行【字段/字段值搜索】，可以从复杂的 JSON 原文中快速获取字段/字段值级联关系
2024.12.28（V1.0.0）：新增工程/二维码工具栏，为工程添加类型筛选，添加搜索框
`

const Header: FC = () => {
  const [message, setMessage] = useLocalStorageState<string | undefined>(
    "zz-chrome-service"
  )

  useEffect(() => {
    sendToBackground({
      name: "store-base-config",
      body: {
        serviceMainUrl: message
      }
    })
  }, [])

  return (
    <>
      <div className={styles.container}>
        <div className={styles.title}>zzChromeTools</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            className={styles.theCurrentRemoteServer}
            onClick={() => setMessage("http://10.238.9.57:3050")}>
            当前远程服务器：{message}
          </div>
          <div
            onClick={() => openWindow("http://10.238.52.99:8000")}
            style={{ cursor: "pointer" }}>
            管理中心
          </div>
          <div onClick={() => alert(updateLog)} style={{ cursor: "pointer" }}>
            更新日志
          </div>
          <div className={styles.version}>V1.0.6</div>
        </div>
      </div>
    </>
  )
}

export default Header
