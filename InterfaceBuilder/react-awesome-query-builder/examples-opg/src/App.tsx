import React from "react"
import QueryBuilder from "./QueryBuilder"
import { Layout } from "antd"

function App() {
  return (
    <Layout>
      <Layout.Content style={{ backgroundColor: "white", padding: 20}}>
        <QueryBuilder />
      </Layout.Content>
    </Layout>
  )
}

export default App
