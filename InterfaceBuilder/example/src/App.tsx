import React from "react"
import { Layout } from "antd"
import "antd/dist/antd.css"
import {
  antComponents,
  ckeditorComponents,
  DragDropContext,
  htmlComponents,
  monacoComponents,
  nivoComponents,
  reachRouterComponents,
  registry,
  syncfusionComponents,
} from "@opg/interface-builder"
import "./App.css"
import "@opg/interface-builder/dist/main.css"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { ExamplesView } from "./views/examples/ExamplesView"
import { HomeView } from "./views/HomeView"
import { QuickStartView } from "./views/QuickStartView"
import { DocsView } from "./views/DocsView"
import { MainMenu } from "./views/MainMenu"
import { TableInterfaceComponent } from "./custom-ib-components/table/TableInterfaceComponent"

/* IB Plugins */
registry.register(antComponents)
registry.register(ckeditorComponents)
registry.register(htmlComponents)
registry.register(monacoComponents)
registry.register(nivoComponents)
registry.register(reachRouterComponents)
registry.register(syncfusionComponents)

/* IB Overrides */
registry.register({ table: TableInterfaceComponent })

const App: React.FC = () => {
  return (
    <DragDropContext.HTML5>
      <Router>
        <Layout className="App">
          <Layout.Header className="header">
            <MainMenu />
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
            <Route path="/docs">
              <DocsView />
            </Route>
          </Switch>
        </Layout>
      </Router>
    </DragDropContext.HTML5>
  )
}

export default App
