import { Breadcrumb, Layout, PageHeader, Typography } from "antd"
import { Helmet } from "react-helmet"
import React from "react"

export function ExamplesIntroView(): JSX.Element {
  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }}>
        <Breadcrumb.Item>Examples</Breadcrumb.Item>
      </Breadcrumb>
      <Layout.Content>
        <Helmet>
          <title>Examples | Interface Builder</title>
        </Helmet>
        <PageHeader
          title="Examples"
          subTitle={
            <span>
              To change the an example&rsquo;s interface, go to the <strong>Edit</strong> tab and
              then click the component&rsquo;s edit icon, or drag new components into the interface
              layout. When you are done, return to the <strong>Preview</strong> tab.
            </span>
          }
        />
        <Typography.Paragraph>Please select an example.</Typography.Paragraph>
      </Layout.Content>
    </>
  )
}
