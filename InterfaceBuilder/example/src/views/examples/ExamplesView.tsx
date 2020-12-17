import { Layout } from "antd"
import FormExample from "../examples/form"
import QueryBuilderExample from "../examples/querybuilder"
import RepeaterExample from "../examples/repeater"
import DataInjectorExample from "../examples/data-injector"
import ButtonExample from "../examples/button"
import React from "react"
import { Route, Switch, useRouteMatch } from "react-router-dom"
import { ExamplesIntroView } from "./ExamplesIntroView"
import { ExamplesMenu } from "../../components/ExamplesMenu"

export function ExamplesView(): JSX.Element {
  const { path, url } = useRouteMatch()

  return (
    <Layout>
      <Layout.Sider width={200} style={{ background: "#fff" }}>
        <ExamplesMenu />
      </Layout.Sider>
      <Layout style={{ padding: "0 24px 24px" }}>
        <Switch>
          <Route exact path={path}>
            <ExamplesIntroView />
          </Route>
          <Route path={`${path}/button`}>
            <ButtonExample />
          </Route>
          <Route path={`${path}/form`}>
            <FormExample />
          </Route>
          <Route path={`${path}/querybuilder`}>
            <QueryBuilderExample />
          </Route>
          <Route path={`${path}/repeater`}>
            <RepeaterExample />
          </Route>
          <Route path={`${path}/data-injector`}>
            <DataInjectorExample />
          </Route>
        </Switch>
      </Layout>
    </Layout>
  )
}
