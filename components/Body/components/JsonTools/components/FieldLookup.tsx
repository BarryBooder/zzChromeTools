// 文件名：FieldLookup.tsx
import { Button, Card, Form, Input, Radio, Select, Table } from "antd"
import TextArea from "antd/es/input/TextArea"
import React, { useState } from "react"

// ------------- 类型定义 -----------------

// 搜索类型：按字段名 or 按字段值
type SearchType = "field" | "value"

// 按值搜索时，可指定搜索的值类型：字符串 / 数字 / 布尔 / null
type ValueDataType = "string" | "number" | "boolean" | "null"

// 每条搜索结果，记录：匹配到的 path + 父级节点数据
interface SearchResult {
  path: string // 如 "a->b->c" 或 "arr->[2]" 等
  parentValue: any // 父级对象/数组
}

// ------------- 搜索逻辑 -----------------

/**
 * 递归搜索 JSON 中满足条件的路径，并记录“父级节点”。
 *
 * @param obj         当前遍历的对象/数组
 * @param searchValue 实际搜索的值（或字段名），类型可能是 number/string/boolean/null
 * @param searchType  "field" 表示按字段名搜索，"value" 表示按值搜索
 * @param path        当前路径（用 a->b->c 这样的形式）
 * @param results     收集结果的数组
 * @param parent      父级对象/数组
 * @returns           返回所有匹配项
 */
function searchJson(
  obj: any,
  searchValue: any,
  searchType: SearchType,
  path = "",
  results: SearchResult[] = [],
  parent?: any
): SearchResult[] {
  if (Array.isArray(obj)) {
    // 如果是数组
    for (let i = 0; i < obj.length; i++) {
      const curPath = path ? `${path}->[${i}]` : `[${i}]`
      // 如果按值搜索 && 当前元素 === searchValue => 命中
      if (searchType === "value" && obj[i] === searchValue) {
        results.push({ path: curPath, parentValue: obj })
      }
      // 递归下去
      if (obj[i] !== null && typeof obj[i] === "object") {
        searchJson(obj[i], searchValue, searchType, curPath, results, obj)
      }
    }
  } else if (obj !== null && typeof obj === "object") {
    // 如果是对象
    for (const key in obj) {
      const curPath = path ? `${path}->${key}` : key
      // 按字段名搜索 && key === searchValue => 命中
      if (searchType === "field" && key === searchValue) {
        results.push({ path: curPath, parentValue: obj })
      }
      // 按值搜索 && obj[key] === searchValue => 命中
      if (searchType === "value" && obj[key] === searchValue) {
        results.push({ path: curPath, parentValue: obj })
      }
      // 递归下去
      if (obj[key] !== null && typeof obj[key] === "object") {
        searchJson(obj[key], searchValue, searchType, curPath, results, obj)
      }
    }
  }

  return results
}

// ------------- 渲染逻辑：只高亮具体命中的属性 -----------------

/**
 * 从 path 的最后一段提取要么是对象 key，要么是数组索引。
 * 例如："a->b->c" => { isArrayIndex:false, nameOrIndex:"c" }
 *      "arr->[2]" => { isArrayIndex:true,  nameOrIndex:2 }
 */
function parseLastSegment(path: string): {
  isArrayIndex: boolean
  nameOrIndex: string | number
} {
  const idx = path.lastIndexOf("->")
  const last = idx >= 0 ? path.slice(idx + 2) : path
  if (last.startsWith("[") && last.endsWith("]")) {
    const inside = last.slice(1, -1) // 去掉方括号
    return { isArrayIndex: true, nameOrIndex: parseInt(inside, 10) }
  } else {
    return { isArrayIndex: false, nameOrIndex: last }
  }
}

/**
 * 将一个父级对象/数组生成带格式的 JSON 字符串，
 * 仅高亮“被匹配到的那一个 key/value”。
 *
 * @param parent         父级对象或数组
 * @param isArrayIndex   是否数组索引
 * @param nameOrIndex    命中的 key 或 index
 * @param searchType     "field"|"value"
 * @param indent         当前缩进
 */
function highlightParentObject(
  parent: any,
  isArrayIndex: boolean,
  nameOrIndex: string | number,
  searchType: SearchType,
  indent = 0
): string {
  const spaces = " ".repeat(indent)

  // 如果是数组
  if (Array.isArray(parent)) {
    let html = "[\n"
    parent.forEach((item, i) => {
      const lineStart = spaces + "  "
      html += lineStart

      // 判断是否就是命中的索引
      if (isArrayIndex && i === nameOrIndex) {
        // 如果按字段名搜索，一般在数组里不会出现
        // 如果按值搜索 => 高亮这个值
        if (searchType === "value") {
          html += `<span style="background-color: yellow;">${formatValue(item)}</span>`
        } else {
          // field 搜索 -> 在数组场景不常见，这里按原样输出
          html += formatValue(item)
        }
      } else {
        // 普通项
        if (item !== null && typeof item === "object") {
          // 继续递归，但不给任何命中信息
          html += highlightParentObject(item, false, "", searchType, indent + 2)
        } else {
          html += formatValue(item)
        }
      }

      if (i < parent.length - 1) {
        html += ",\n"
      } else {
        html += "\n"
      }
    })
    html += spaces + "]"
    return html
  }
  // 如果是对象
  else if (parent !== null && typeof parent === "object") {
    let html = "{\n"
    const keys = Object.keys(parent)
    keys.forEach((key, idx) => {
      const lineStart = spaces + "  "

      // 是否是命中的 key (当 isArrayIndex=false，且 key===nameOrIndex)
      const isMatchedKey = !isArrayIndex && key === nameOrIndex

      // 1. 按字段名搜索 & 命中 => 高亮 key
      if (searchType === "field" && isMatchedKey) {
        html += `${lineStart}<span style="background-color: yellow;">"${key}"</span>: `
        html += printChildValue(parent[key], searchType, indent)
      }
      // 2. 按值搜索 & 命中 => 其实是 parent[key] 的值被命中
      //    path = ...->key, 说明 key 就是 nameOrIndex
      else if (searchType === "value" && isMatchedKey) {
        // 高亮这个值
        html += `${lineStart}"${key}": `
        html += `<span style="background-color: yellow;">${formatValue(parent[key])}</span>`
      }
      // 3. 其他普通字段
      else {
        html += `${lineStart}"${key}": `
        html += printChildValue(parent[key], searchType, indent)
      }

      if (idx < keys.length - 1) {
        html += ",\n"
      } else {
        html += "\n"
      }
    })
    html += spaces + "}"
    return html
  }
  // 如果是基本类型
  return formatValue(parent)
}

/**
 * 递归打印子属性，但不再带“命中信息”。
 * 以免子对象里还有同值，也意外被高亮。
 */
function printChildValue(
  value: any,
  searchType: SearchType,
  indent: number
): string {
  if (value !== null && typeof value === "object") {
    // 这里不传 nameOrIndex, 使其不会命中任何 key
    return highlightParentObject(value, false, "", searchType, indent + 2)
  } else {
    return formatValue(value)
  }
}

/**
 * 将基本类型转为 JSON-like 字符串
 */
function formatValue(val: any): string {
  if (val === null) return "null"
  if (typeof val === "string") return `"${val}"`
  return String(val)
}

// ------------- 主组件 -----------------

const FieldLookup: React.FC = () => {
  // 1) 用户输入的 JSON
  const [jsonString, setJsonString] = useState("")

  // 2) 搜索内容
  const [searchTerm, setSearchTerm] = useState("")
  // 3) 搜索类型：默认按字段名
  const [searchType, setSearchType] = useState<SearchType>("field")
  // 4) 当 searchType="value" 时，需要指定“值类型”
  const [valueDataType, setValueDataType] = useState<ValueDataType>("string")

  // 搜索结果
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState("")

  // 用于展开/收起
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  /**
   * 将字符串搜索词转换为指定类型(仅在按值搜索时用)
   */
  const convertValue = (rawStr: string, type: ValueDataType): any => {
    switch (type) {
      case "string":
        return rawStr
      case "number":
        return Number(rawStr) // 若非数字，会变 NaN
      case "boolean":
        return rawStr === "true"
      case "null":
        return null
      default:
        return rawStr
    }
  }

  const handleSearch = () => {
    setResults([])
    setError("")
    setExpandedRows(new Set())

    if (!searchTerm.trim()) {
      setError("请输入搜索关键词")
      return
    }

    try {
      // 解析 JSON
      const data = JSON.parse(jsonString)

      // 若是按值搜索，先将输入转成指定类型
      let realValue: any = searchTerm.trim()
      if (searchType === "value") {
        realValue = convertValue(realValue, valueDataType)
      }

      // 调用搜索逻辑
      const foundPaths = searchJson(data, realValue, searchType)
      if (foundPaths.length === 0) {
        setError("没有找到任何匹配项")
      } else {
        setResults(foundPaths)
      }
    } catch (err) {
      setError("JSON 解析失败，请检查 JSON 格式")
      console.error(err)
    }
  }

  // 控制行的展开收起
  const toggleExpand = (index: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // 表格列
  const columns = [
    {
      title: "匹配路径",
      dataIndex: "path",
      key: "path",
      width: "40%"
    },
    {
      title: "父级节点(仅高亮命中属性)",
      dataIndex: "parentValue",
      key: "parentValue",
      render: (parent: any, record: SearchResult, rowIndex: number) => {
        const isExpanded = expandedRows.has(rowIndex)
        // 从 path 中提取最后一段
        const { isArrayIndex, nameOrIndex } = parseLastSegment(record.path)
        return (
          <>
            <Button size="small" onClick={() => toggleExpand(rowIndex)}>
              {isExpanded ? "收起" : "展开"}
            </Button>
            {isExpanded ? (
              <pre
                style={{ whiteSpace: "pre-wrap", marginTop: 8 }}
                // 用 dangerouslySetInnerHTML 来渲染带 <span> 的 HTML
                dangerouslySetInnerHTML={{
                  __html: highlightParentObject(
                    parent, // 父级对象
                    isArrayIndex, // 是否数组索引
                    nameOrIndex, // 实际命中的 key/index
                    searchType // "field" or "value"
                  )
                }}
              />
            ) : (
              <div style={{ color: "gray", marginTop: 8 }}>
                （点击“展开”查看）
              </div>
            )}
          </>
        )
      }
    }
  ]

  return (
    <Card title="JSON 字段/值 查找工具（仅高亮命中属性）" size="small">
      <Form layout="vertical">
        {/* 1. 输入 JSON */}
        <Form.Item label="JSON 原文">
          <TextArea
            rows={6}
            value={jsonString}
            onChange={(e) => setJsonString(e.target.value)}
            placeholder='{"price":148400,"nullVal":null,"boolVal":false,"arr":["abc",123]}'
          />
        </Form.Item>

        {/* 2. 搜索关键词 */}
        <Form.Item label="搜索关键词">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='如 "price" 或 "148400" 或 "false"'
          />
        </Form.Item>

        {/* 3. 搜索类型 */}
        <Form.Item label="搜索类型">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8
            }}>
            <div>
              <Radio.Group
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as SearchType)}>
                <Radio value="field">按字段名</Radio>
                <Radio value="value">按字段值</Radio>
              </Radio.Group>
              {/* 当 searchType = "value" 时，才展示“值类型”下拉 */}
              {searchType === "value" && (
                <Select<ValueDataType>
                  value={valueDataType}
                  onChange={(val) => setValueDataType(val)}
                  style={{ width: 100 }}>
                  <Select.Option value="string">字符串</Select.Option>
                  <Select.Option value="number">数字</Select.Option>
                  <Select.Option value="boolean">布尔</Select.Option>
                  <Select.Option value="null">null</Select.Option>
                </Select>
              )}
            </div>
            <Button onClick={handleSearch}>开始查找</Button>
          </div>
        </Form.Item>
      </Form>

      {error && (
        <div style={{ color: "red", marginTop: 8 }}>
          <strong>{error}</strong>
        </div>
      )}

      {/* 展示搜索结果 */}
      {!error && results.length > 0 && (
        <Table
          style={{ marginTop: 16 }}
          columns={columns}
          dataSource={results.map((item, idx) => ({
            key: idx,
            ...item
          }))}
          pagination={false}
        />
      )}
    </Card>
  )
}

export default FieldLookup
