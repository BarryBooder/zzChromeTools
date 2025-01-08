// import type { FC } from "react"
// import fontPropertiesHTML from "url:../components/panels/font-properties/index.html"
// import fontPickerHTML from "url:../components/panels/SpmTools/index.html"
//
// chrome.devtools.panels.create(
//   "zzChrome工具",
//   null,
//   fontPickerHTML.split("/").pop()
// )
//
// chrome.devtools.panels.elements.createSidebarPane(
//   "zzChrome工具",
//   function (sidebar) {
//     sidebar.setPage(fontPropertiesHTML.split("/").pop())
//   }
// )
//
// const Devtools: FC = () => {
//   return <div>Devtools</div>
// }
//
// export default Devtools

// devtools/index.tsx
import type { FC } from "react"
import spmToolsHTML from "url:../components/panels/SpmTools/index.html"

chrome.devtools.panels.create(
  "zzChrome工具",
  null,
  spmToolsHTML.split("/").pop()
)

const Devtools: FC = () => {
  return <div>Devtools Tab</div>
}

export default Devtools
