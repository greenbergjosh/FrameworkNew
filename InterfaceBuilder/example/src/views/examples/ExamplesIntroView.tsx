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
            subTitle={
              <span>
                To change the interface, go to the <strong>Configure</strong> tab and then click the
                component&rsquo;s edit icon, or drag new components into the interface layout. When
                you are done, return to the <strong>Preview</strong> tab.
              </span>
            }
          />
          <h3>Please select an example.</h3>
        </Card>
      </Layout.Content>
    </>
  )
}
