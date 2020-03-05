import React from "react"
import Helmet from "react-helmet"
import { Card, Divider, Layout, PageHeader, Tabs, Typography } from "antd"
import { ComponentDefinition, UserInterface } from "@opg/interface-builder"
import config from "./example-config.json"
import "./code.css"

const { Title, Text } = Typography
const { TabPane } = Tabs

const DndExample: React.FC = () => {
  const [data, setData] = React.useState({})
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([config])

  return (
    <Card>
      <Helmet>
        <title>Form Example | Interface Builder</title>
      </Helmet>
      <PageHeader
        title="Form Example"
        subTitle="To change the form, click the Configure tab and drag components into the layout. When you are done, click the Preview tab."
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
                onChangeData={(newData) => {
                  console.log("New Data", newData)
                  setData(newData)
                }}
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
            onChangeData={(newData) => {
              console.log("New Data", newData)
              setData(newData)
            }}
            onChangeSchema={(newSchema) => {
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

export default DndExample
