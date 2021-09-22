import { Layout } from "antd"
import React from "react"
import { Helmet } from "react-helmet"

export const DocsView: React.FC = (): JSX.Element => {
  return (
    <>
      <Helmet>
        <title>Docs | InterfaceBuilder.js</title>
      </Helmet>
      <Layout.Content>
        <h2>Docs (to come)</h2>
      </Layout.Content>
    </>
  )
}
