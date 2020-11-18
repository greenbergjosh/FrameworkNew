import React from "react"
import { Breadcrumb, Layout } from "antd"
import "antd/dist/antd.css"
import {
  antComponents,
  DragDropContext,
  htmlComponents,
  nivoComponents,
  registry,
} from "@opg/interface-builder"
import TopMenu from "./components/nav/top-menu"
import SideMenu from "./components/nav/side-menu"
import FormExample from "./components/examples/form"
import QueryBuilderExample from "./components/examples/querybuilder"
import RepeaterExample from "./components/examples/repeater"
import "./App.css"
import "@opg/interface-builder/dist/main.css"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"

const { Header, Content, Sider } = Layout
registry.register(antComponents)
registry.register(nivoComponents)
registry.register(htmlComponents)

const App: React.FC = () => {
  return (
    <DragDropContext.HTML5>
      <Router>
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
                <Breadcrumb.Item>
                  <Link to="/examples">Examples</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Form</Breadcrumb.Item>
              </Breadcrumb>
              <Content>
                <Switch>
                  <Route path="/examples/form">
                    <FormExample />
                  </Route>
                  <Route path="/examples/querybuilder">
                    <QueryBuilderExample />
                  </Route>
                  <Route path="/examples/repeater">
                    <RepeaterExample />
                  </Route>
                </Switch>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </Router>
    </DragDropContext.HTML5>
  )
}

export default App
