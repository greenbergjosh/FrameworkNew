import { Breadcrumb, Card, Layout, PageHeader } from "antd"
import { Helmet } from "react-helmet"
import React from "react"

export function ExamplesIntroView(): JSX.Element {
  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>Examples</Breadcrumb.Item>
      </Breadcrumb>
      <Layout.Content>
        <Card>
          <Helmet>
            <title>Examples | Interface Builder</title>
          </Helmet>
          <PageHeader
            title="Examples"
            subTitle="To change the components, click the Configure tab and drag components into the layout. When you are done, click the Preview tab."
          />
          <h3>Please select an example.</h3>
        </Card>
      </Layout.Content>
    </>
  )
}
