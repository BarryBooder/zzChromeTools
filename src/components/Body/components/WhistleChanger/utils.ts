import { envIpEnums } from "~src/components/Body/components/WhistleChanger/constant"

export const makeRule = (
  front: string,
  backend: string,
  env: "DEV" | "SANDBOX" = "DEV"
) => {
  const rawRule = `
    # FE,${env},btocyy
    ${envIpEnums[env]} */u/b2c_pop_detail/ reqHeaders://{"Global-Route-Tag":"${front}"}

    # RD,${env},btocy
    ${envIpEnums[env]} app.zhuanzhuan.com reqHeaders://{"Global-Route-Tag":"${backend}"}
  `

  // 去掉每行首尾空格，但仍保留行与行之间的空行
  // 再用换行拼回
  return rawRule
    .split("\n")
    .map((line) => line.trim()) // 去掉开头、结尾空格
    .join("\n")
}
