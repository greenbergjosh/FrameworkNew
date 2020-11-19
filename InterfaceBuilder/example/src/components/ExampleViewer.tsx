import { ComponentDefinition, UserInterface, UserInterfaceProps } from "@opg/interface-builder"
import { Breadcrumb, Card, Divider, Layout, PageHeader, Tabs, Typography } from "antd"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet"
import React from "react"
import "./code.css"

const { Title, Text } = Typography
const { TabPane } = Tabs

export function ExampleViewer(props: {
  components: ComponentDefinition[]
  data: Record<string, unknown>
  onChangeData: (nextData: UserInterfaceProps["data"]) => void
  onChangeData1: (newData: UserInterfaceProps["data"]) => void
  onChangeSchema: (newSchema: ComponentDefinition[]) => void
  title: string
}) {
  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>
          <Link to="/examples">Examples</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{props.title}</Breadcrumb.Item>
      </Breadcrumb>
      <Layout.Content>
        <Card>
          <Helmet>
            <title>{props.title} Example | Interface Builder</title>
          </Helmet>
          <PageHeader
            title={`${props.title} Example`}
            subTitle="To change the component, click the Configure tab and drag components into the layout. When you are done, click the Preview tab."
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
                    components={props.components}
                    data={props.data}
                    onChangeData={props.onChangeData}
                  />
                </Layout.Content>
              </Layout>
              <Divider />
              <Title level={3}>Data Model</Title>
              <pre>
                <Text code>{JSON.stringify(props.data, null, 2)}</Text>
              </pre>
            </TabPane>

            {/*************************
             * CONFIGURE TAB
             */}
            <TabPane tab="Configure" key="2">
              <UserInterface
                mode="edit"
                components={props.components}
                data={props.data}
                onChangeData={props.onChangeData1}
                onChangeSchema={props.onChangeSchema}
              />
            </TabPane>

            {/*************************
             * SCHEMA TAB
             */}
            <TabPane tab="Schema" key="3">
              <Title level={3}>Interface Schema</Title>
              <pre>
                <Text code>{JSON.stringify(props.components, null, 2)}</Text>
              </pre>
            </TabPane>
          </Tabs>
        </Card>
      </Layout.Content>
    </>
  )
}
