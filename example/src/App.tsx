import React from "react"
import { Breadcrumb, Layout } from "antd"
import "antd/dist/antd.css"
import { antComponents, registry } from "interface-builder"
import TopMenu from "./components/nav/top-menu"
import SideMenu from "./components/nav/side-menu"
import DndExample from "./components/examples/dnd"
import "./App.css"

const { Header, Content, Sider } = Layout
registry.register(antComponents)

const App: React.FC = () => {
  return (
    <Layout className="App">
      <Header className="header">
        <div className="logo" />
        <TopMenu />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: "#fff" }}>
          <SideMenu />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Examples</Breadcrumb.Item>
            <Breadcrumb.Item>Drag-n-Drop</Breadcrumb.Item>
          </Breadcrumb>
          <Content>
            <DndExample />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default App
