import React from "react"
import { Helmet } from "react-helmet"
import { Card, Divider, Layout, PageHeader, Tabs, Typography } from "antd"
import { ComponentDefinition, UserInterface } from "@opg/interface-builder"
import config from "./example-config.json"
import initialData from "./example-data.json"
import "./code.css"
import { UserInterfaceProps } from "../../../../../src"

const { Title, Text } = Typography
const { TabPane } = Tabs

const RepeaterExample: React.FC = () => {
  const [data, setData] = React.useState(initialData)
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([config])

  const handleChangeData = React.useCallback((nextData: UserInterfaceProps["data"]) => {
    setData(nextData)
  }, [])

  return (
    <Card>
      <Helmet>
        <title>Repeater Example | Interface Builder</title>
      </Helmet>
      <PageHeader
        title="Repeater Example"
        subTitle="To change the components, click the Configure tab and drag components into the layout. When you are done, click the Preview tab."
      />
      <Tabs defaultActiveKey="1">
        {/*************************
         * PREVIEW TAB
         */}
        <TabPane tab="Preview" key="1">
          <Title level={3}>Rendered View</Title>
          <Layout>
            <Layout.Content
              style={{
                margin: "16px",
                padding: 24,
                background: "#fff",
                minHeight: 280,
              }}>
              <UserInterface
                mode="display"
                components={schema}
                data={data}
                onChangeData={handleChangeData}
              />
            </Layout.Content>
          </Layout>
          <Divider />
          <Title level={3}>Data Model</Title>
          <pre>
            <Text code>{JSON.stringify(data, null, 2)}</Text>
          </pre>
        </TabPane>

        {/*************************
         * CONFIGURE TAB
         */}
        <TabPane tab="Configure" key="2">
          <UserInterface
            mode="edit"
            components={schema}
            data={data}
            onChangeData={(newData: UserInterfaceProps["data"]) => {
              console.log("New Data", newData)
              setData(newData)
            }}
            onChangeSchema={(newSchema: ComponentDefinition[]) => {
              console.log("New Schema", newSchema)
              setSchema(newSchema)
            }}
          />
        </TabPane>

        {/*************************
         * SCHEMA TAB
         */}
        <TabPane tab="Schema" key="3">
          <Title level={3}>Interface Schema</Title>
          <pre>
            <Text code>{JSON.stringify(schema, null, 2)}</Text>
          </pre>
        </TabPane>
      </Tabs>
    </Card>
  )
}

export default RepeaterExample
