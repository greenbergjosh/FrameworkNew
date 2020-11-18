import React from "react"
import { Layout, Menu } from "antd"
import "antd/dist/antd.css"
import {
  antComponents,
  DragDropContext,
  htmlComponents,
  nivoComponents,
  registry,
} from "@opg/interface-builder"
import "./App.css"
import "@opg/interface-builder/dist/main.css"
import { BrowserRouter as Router, Link, Route, Switch, useLocation } from "react-router-dom"
import { ExamplesView } from "./views/examples/ExamplesView"
import { HomeView } from "./views/HomeView"
import { QuickStartView } from "./views/QuickStartView"
import { ReferenceView } from "./views/ReferenceView"

registry.register(antComponents)
registry.register(nivoComponents)
registry.register(htmlComponents)

const App: React.FC = () => {
  return (
    <DragDropContext.HTML5>
      <Router>
        <Layout className="App">
          <Layout.Header className="header">
            <div className="logo" />
            <Menu theme="dark" mode="horizontal" style={{ lineHeight: "64px" }}>
              <Menu.Item key="1">
                <Link to="/">Home</Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to="/examples">Examples</Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to="/quick-start">Quick Start</Link>
              </Menu.Item>
              <Menu.Item key="4">
                <Link to="/reference">Reference</Link>
              </Menu.Item>
            </Menu>
          </Layout.Header>
          <Switch>
            <Route exact path="/">
              <HomeView />
            </Route>
            <Route path="/examples">
              <ExamplesView />
            </Route>
            <Route path="/quick-start">
              <QuickStartView />
            </Route>
            <Route path="/reference">
              <ReferenceView />
            </Route>
          </Switch>
        </Layout>
      </Router>
    </DragDropContext.HTML5>
  )
}

export default App
