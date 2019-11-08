import React from "react"
import Helmet from "react-helmet"
import { Card, Divider, Layout, PageHeader, Tabs, Typography } from "antd"
import { ComponentDefinition, UserInterface } from "interface-builder"
import config from "./example-config.json"

const { Title, Text } = Typography
const { TabPane } = Tabs

const DndExample: React.FC = () => {
  const [data, setData] = React.useState({})
  const [schema, setSchema] = React.useState<ComponentDefinition[]>([config])

  return (
    <Card>
      <Helmet>
        <title>Drag-n-Drop Example | Interface Builder</title>
      </Helmet>
      <PageHeader
        title="Drag-n-Drop Example"
        subTitle="Drag components into the layout. When you are done, click the Preview tab."
      />
      <Tabs defaultActiveKey="1">
        {/*************************
         * CONFIGURE TAB
         */}
        <TabPane tab="Configure" key="1">
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
         * PREVIEW TAB
         */}
        <TabPane tab="Preview" key="2">
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
