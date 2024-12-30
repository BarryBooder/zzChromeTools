import { Button, Card, Col, Form, Row, Select } from "antd"
import React, { type FC } from "react"
import { sendMessage } from "webext-bridge/popup"

import { makeRule } from "~components/Body/components/WhistleChanger/utils"

import styles from "./index.module.css"

const WhistleChanger: FC = () => {
  const [form] = Form.useForm()

  // 点击按钮后，通过 sendMessage 请求后台脚本
  const handleChangRule = async () => {
    try {
      const validateFieldsResult = await form.validateFields()
      if (validateFieldsResult) {
        // 组装要传给 Whistle 的规则
        const rule = makeRule(
          form.getFieldValue("frontProxy"),
          form.getFieldValue("backendProxy")
        )
        const params = {
          name: "zzChromeTools-Auto",
          clientId: "1734663992675-5",
          key: "w-reactkey-232",
          value: rule,
          selected: true,
          active: true,
          hide: false,
          changed: true
        }

        // 使用 webext-bridge 的 sendMessage
        const response: Whistle.ChangeWhistleRuleResponse = await sendMessage(
          "CHANGE_WHISTLE_RULE",
          params,
          "background"
        )

        if (response.success) {
          console.log("changeWhistleRuleResult", response.data)
          alert("代理规则更新成功！")
        } else {
          console.error("Failed to change whistle rule:", response.error)
          alert("代理规则更新失败： " + response.error)
        }
      }
    } catch (error) {
      console.error("表单校验失败:", error)
    }
  }

  return (
    <Card title="代理配置" className={styles.formContainer} size="small">
      <Form form={form}>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="环境" name="env">
              <Select
                options={[
                  { value: "test", label: "测试环境" },
                  { value: "sandBox", label: "沙箱环境" }
                ]}
              />
            </Form.Item>
            <Form.Item label="工程" name="project">
              <Select
                options={[{ value: "b2c_pop_detail", label: "b2c_pop_detail" }]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="前端代理" name="frontProxy">
              <Select
                options={[
                  {
                    value: "newtest",
                    label: "贺一健"
                  }
                ]}
              />
            </Form.Item>
            <Form.Item label="后端代理" name="backendProxy">
              <Select
                options={[
                  {
                    value: "sandboxmyatest",
                    label: "米迎澳"
                  },
                  {
                    value: "sandboxdanny",
                    label: "张三"
                  }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Button onClick={handleChangRule} type="primary" block>
        应用
      </Button>
    </Card>
  )
}

export default WhistleChanger
