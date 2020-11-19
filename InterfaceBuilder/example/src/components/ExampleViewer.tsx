import { ComponentDefinition, UserInterface, UserInterfaceProps } from "@opg/interface-builder"
import {
  Breadcrumb,
  Card,
  Divider,
  Layout,
  PageHeader,
  Tabs,
  Typography,
  Popover,
  Icon,
} from "antd"
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
        <Helmet>
          <title>{props.title} Example | Interface Builder</title>
        </Helmet>
        <PageHeader
          title={`${props.title} Example`}
          subTitle="To change the interface, go to the Configure tab and then click the component's edit icon, or drag new components into the interface layout. When you are done, return to the Preview tab. "
        />
        <Tabs defaultActiveKey="1">
          {/*************************
           * PREVIEW TAB
           */}
          <TabPane tab="Preview" key="1">
            <Card>
              <UserInterface
                mode="display"
                components={props.components}
                data={props.data}
                onChangeData={props.onChangeData}
              />
            </Card>
          </TabPane>

          {/*************************
           * DATA TAB
           */}
          <TabPane
            tab={
              <>
                Data{" "}
                <Popover
                  content={"Shows the data generated from input entered into the interface."}>
                  <Icon type="question-circle" />
                </Popover>
              </>
            }
            key="3">
            <Typography.Paragraph type="secondary">
              <Icon type="info-circle" /> The data generated from input entered into the interface.
            </Typography.Paragraph>
            <pre>
              <Text code>{JSON.stringify(props.data, null, 2)}</Text>
            </pre>
          </TabPane>

          {/*************************
           * CONFIGURE TAB
           */}
          <TabPane tab="Configure" key="2">
            <Card>
              <UserInterface
                mode="edit"
                components={props.components}
                data={props.data}
                onChangeData={props.onChangeData1}
                onChangeSchema={props.onChangeSchema}
              />
            </Card>
          </TabPane>

          {/*************************
           * SCHEMA TAB
           */}
          <TabPane
            tab={
              <>
                Schema{" "}
                <Popover content={"Shows the config that defines this interface layout."}>
                  <Icon type="question-circle" />
                </Popover>
              </>
            }
            key="4">
            <Typography.Paragraph type="secondary">
              <Icon type="info-circle" /> The config that defines this interface layout.
            </Typography.Paragraph>
            <pre>
              <Text code>{JSON.stringify(props.components, null, 2)}</Text>
            </pre>
          </TabPane>
        </Tabs>
      </Layout.Content>
    </>
  )
}
