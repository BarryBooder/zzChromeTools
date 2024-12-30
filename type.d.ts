declare namespace Whistle {
  type ChangeWhistleRuleRequest = {
    name: string
    value: string
    selected: boolean
    active: boolean
    hide: boolean
    changed: boolean
    clientId?: string
    key?: string
  }

  type ChangeWhistleRuleResponse = {
    success: boolean
    data?: any
    error?: string
  }
}

declare namespace MainType {
  type Response = {
    success: boolean
    data?: any
    error?: string
  }
}

declare namespace Project {
  type Data = {
    id: number
    name: string
    desc: string
    defaultUrl: string
    defaultInfoId?: string
    type: string
  }
}
