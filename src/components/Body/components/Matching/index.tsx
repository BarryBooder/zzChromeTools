import { useDebounceFn } from "ahooks"
import { Button, Card, Form, Input, message, Segmented, Table } from "antd"
import { useEffect, useState, type FC } from "react"
import { sendMessage } from "webext-bridge/popup"

import { categoryColumns, urlColumns } from "./constant"
import styles from "./index.module.css"

const Matching: FC = () => {
  const [isMatched, setIsMatched] = useState(false) // 是否匹配
  const [currentKey, setCurrentKey] = useState("") // 当前匹配的 key
  const [projectData, setProjectData] = useState<Project.Data[]>([])
  const [filterType, setFilterType] = useState("全部")
  const [filterProjectData, setFilterProjectData] = useState<Project.Data[]>([])
  const [categoryData, setCategoryData] = useState([])
  const [form] = Form.useForm()

  // 获取工程列表
  const fetchProjectList = async () => {
    const resp: MainType.Response = await sendMessage(
      "GET_PROJECT_LIST",
      "",
      "background"
    )
    if (resp.success) {
      setProjectData(resp.data.data)
      setFilterProjectData(resp.data.data)
    } else {
      message.error("获取工程列表失败")
    }
  }

  // 匹配 URL 并初始化数据
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) {
        setCurrentKey("错误")
        setIsMatched(false)
        return
      }

      const currentUrl = tabs[0].url || ""
      const regex = /\/u\/([^/]+)/
      const matchCurrentUrl = currentUrl?.match(regex)?.[1] || ""

      if (matchCurrentUrl) {
        const categoryResp: MainType.Response = await sendMessage(
          "GET_CATEGORY_BY_PROJECT_NAME",
          { name: matchCurrentUrl },
          "background"
        )
        if (categoryResp.success) {
          setCategoryData(categoryResp.data.data)
          setCurrentKey(matchCurrentUrl)
          setIsMatched(true)
        }
      } else {
        setIsMatched(false)
        setCurrentKey("未命中")
        await fetchProjectList()
      }
    })
  }, [])

  // 通用过滤逻辑
  const filterProjects = () => {
    const searchValue = form.getFieldValue("projectSearch") || "" // 直接从表单中获取搜索值
    const filteredData = projectData.filter(
      (item) =>
        (item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.desc.includes(searchValue)) &&
        (filterType === "全部" || item.type === filterType)
    )
    setFilterProjectData(filteredData)
  }

  // 搜索项目
  const { run: handleSearchProject } = useDebounceFn(
    () => {
      filterProjects() // 直接调用过滤逻辑
    },
    { wait: 500 }
  )

  // 筛选类型
  const { run: handleTypeSelect } = useDebounceFn(
    () => {
      filterProjects() // 直接调用过滤逻辑
    },
    { wait: 100 }
  )

  // 切换 Tab
  const handleTypeChange = (value: string) => {
    setFilterType(value)
    handleTypeSelect()
  }

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
          <div>工程跳转</div>
          {!isMatched && (
            <Segmented
              value={filterType}
              onChange={handleTypeChange}
              options={["全部", "前端常用", "后端常用", "其他"]}
            />
          )}
        </div>
      }
      size="small">
      <div className={styles.container}>
        <div className={styles.header}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className={styles.title}>当前匹配：</div>
            <div
              className={styles.desc}
              style={isMatched ? { color: "green" } : {}}>
              {currentKey}
            </div>
          </div>
          {!isMatched && (
            <>
              <Form form={form} onValuesChange={handleSearchProject}>
                <Form.Item name="projectSearch" style={{ marginBottom: 0 }}>
                  <Input placeholder="搜索工程名称……" />
                </Form.Item>
              </Form>
              <Button onClick={fetchProjectList}>更新工程列表</Button>
            </>
          )}
        </div>
        {isMatched ? (
          <div className={styles.categoryTable}>
            <Table
              dataSource={categoryData}
              columns={categoryColumns}
              size="small"
              pagination={false}
              rowKey={(record) => record.id}
            />
          </div>
        ) : (
          <div className={styles.urlListTable}>
            <Table
              dataSource={filterProjectData}
              columns={urlColumns}
              size="small"
              pagination={false}
              rowKey={(record) => record.id}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

export default Matching
