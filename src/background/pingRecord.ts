// background/pingStorage.ts

export interface PingRecord {
  id: string
  time: string
  pagetype: string
  actiontype: string
  sectionId: string
  sortId: string
  sortName: string
  fullData: any
}

/** 全局只在内存中保存，刷新/重启后会丢失 */
export const pingRecords: PingRecord[] = []
