import type { PlasmoCSConfig } from "plasmo"

import "~src/injected/requestInterception"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

console.log("内容脚本已运行")
const script = document.createElement("script")
script.setAttribute(
  "src",
  chrome.runtime.getURL("injected/requestInterception.js")
)
document.head.appendChild(script)
