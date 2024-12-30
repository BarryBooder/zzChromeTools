import type { TableColumnsType } from "antd"

import { openWindow } from "~components/Body/components/Matching/utils"

const makeFullUrl = (category: string, infoId: string) => {
  switch (category) {
    case "streamline_detail": {
      return `https://m.zhuanzhuan.com/u/streamline_detail/new-goods-detail?init_from=2_1_17821_0&infoId=${infoId}&metric=itXYBmuMR5CJhM2neOHO4Q21217o28&needHideShare=1&needHideHead=3&quickStart=1&search_metric=null&refContent=`
    }
    case "b2c_pop_detail": {
      return `https://m.zhuanzhuan.com/u/b2c_pop_detail/?zzfrom=LinkCopy&infoId=${infoId}&metric=isO37nFnoXaRtCxUI4nzHA11121183g&needHideHead=3&needHideShare=1&quickStart=1&zzv=11.1.1&tt=2A479B95D17C8E9E58416810C4E053DE&isshare=true&shareuid=1784416146124910464`
    }
    default: {
      return ""
    }
  }
}

export const categoryColumns: TableColumnsType = [
  {
    title: "品类",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "备注",
    dataIndex: "desc",
    key: "desc"
  },
  {
    title: "默认infoId",
    dataIndex: "defaultInfoId",
    key: "defaultInfoId",
    render: (text, record) => (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          openWindow(
            `${record.project.defaultUrl}&infoId=${record.defaultInfoId}`
          )
        }}>
        {text}
      </a>
    )
  }
]

export const urlColumns: TableColumnsType = [
  {
    title: "工程名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "备注",
    dataIndex: "desc",
    key: "desc"
  },
  {
    title: "默认URL",
    dataIndex: "defaultUrl",
    key: "defaultUrl",
    render: (text, record) => (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          openWindow(
            record.defaultInfoId
              ? `${text}&infoId=${record.defaultInfoId}`
              : text
          )
        }}>
        点击跳转
      </a>
    )
  },
  {
    title: "类型",
    dataIndex: "type",
    key: "type"
  }
]
