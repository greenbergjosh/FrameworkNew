import {
  ComponentDefinition,
  JSONEditor,
  JSONRecord,
  UserInterface,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { Breadcrumb, Card, Icon, Layout, PageHeader, Popover, Tabs, Typography } from "antd"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet"
import React from "react"
import "./styles.css"

const { TabPane } = Tabs

export function ExampleView(props: {
  components: ComponentDefinition[]
  data: Record<string, unknown>
  onChangeData: (nextData: UserInterfaceProps["data"]) => void
  onChangeData1: (newData: UserInterfaceProps["data"]) => void
  onChangeSchema: (newSchema: ComponentDefinition[]) => void
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  title: string
  description: string | React.ReactNode
}): JSX.Element {
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
          <title>{props.title} Example | InterfaceBuilder.js</title>
        </Helmet>
        <PageHeader title={`${props.title} Example`} subTitle={props.description} />
        <Tabs defaultActiveKey="1">
          {/*************************
           * PREVIEW TAB
           */}
          <TabPane tab="Preview" key="1">
            <Card>
              <UserInterface
                components={props.components}
                data={props.data}
                getRootUserInterfaceData={props.getRootUserInterfaceData}
                mode="display"
                onChangeData={props.onChangeData}
                onChangeRootData={props.onChangeRootData}
              />
            </Card>
          </TabPane>

          {/*************************
           * EDIT TAB
           */}
          <TabPane tab="Edit" key="2">
            <Card>
              <UserInterface
                components={props.components}
                data={props.data}
                getRootUserInterfaceData={props.getRootUserInterfaceData}
                mode="edit"
                onChangeData={props.onChangeData1}
                onChangeSchema={props.onChangeSchema}
                onChangeRootData={props.onChangeRootData}
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
            <Typography.Paragraph type="secondary" style={{ fontStyle: "italic" }}>
              <Icon type="info-circle" /> The data generated from input entered into the interface
              components. This data can be persisted and used to re-populate the interface&rsquo;s
              component values.
            </Typography.Paragraph>
            <JSONEditor
              data={props.data as JSONRecord}
              onChange={props.onChangeData}
              height={"60vh"}
              collapsed={false}
            />
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
            <Typography.Paragraph type="secondary" style={{ fontStyle: "italic" }}>
              <Icon type="info-circle" /> The schema that defines this interface layout. This schema
              can be persisted and used to re-create the interface.
            </Typography.Paragraph>
            <JSONEditor
              data={props.components as JSONRecord[]}
              onChange={props.onChangeSchema as (data: unknown) => void}
              height={"60vh"}
              collapsed={false}
            />
          </TabPane>
        </Tabs>
      </Layout.Content>
    </>
  )
}
