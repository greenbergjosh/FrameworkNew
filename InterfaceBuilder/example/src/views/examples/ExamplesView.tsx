import { Layout } from "antd"
import QueryBuilderExample from "../examples/querybuilder"
import RepeaterExample from "../examples/repeater"
import DataInjectorExample from "../examples/data-injector"
import TextExample from "../examples/text"
import ButtonExample from "../examples/button"
import DateStepperExample from "./date-stepper"
import DateRangeExample from "./date-range"
import TableExample from "./table"
import PropTokensExample from "./prop-tokens"
import RadioExample from "./radio"
import DataBindingExample from "./data-binding"
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
          <Route path={`${path}/querybuilder`}>
            <QueryBuilderExample />
          </Route>
          <Route path={`${path}/repeater`}>
            <RepeaterExample />
          </Route>
          <Route path={`${path}/data-injector`}>
            <DataInjectorExample />
          </Route>
          <Route path={`${path}/text`}>
            <TextExample />
          </Route>
          <Route path={`${path}/date-stepper`}>
            <DateStepperExample />
          </Route>
          <Route path={`${path}/date-range`}>
            <DateRangeExample />
          </Route>
          <Route path={`${path}/table`}>
            <TableExample />
          </Route>
          <Route path={`${path}/prop-tokens`}>
            <PropTokensExample />
          </Route>
          <Route path={`${path}/radio`}>
            <RadioExample />
          </Route>
          <Route path={`${path}/data-binding`}>
            <DataBindingExample />
          </Route>
        </Switch>
      </Layout>
    </Layout>
  )
}
