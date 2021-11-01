import React from "react"
import { Layout, Menu } from "antd"
import { Route, Switch, useLocation, useRouteMatch } from "react-router-dom"
import { ExamplesIntroView } from "./ExamplesIntroView"
import { ChartMenu } from "./chart/ChartMenu"
import { FormMenu } from "./form/FormMenu"
import { DisplayMenu } from "./display/DisplayMenu"
import { SpecialMenu } from "./special/SpecialMenu"
import { FrameworkMenu } from "./framework/FrameworkMenu"
import ButtonExample from "./form/button"
import QueryBuilderExample from "./form/querybuilder"
import DateStepperExample from "./form/date-stepper"
import RadioExample from "./form/radio"
import NumberExample from "./form/number"
import NumberRangeExample from "./form/number-range"
import StringTemplateExample from "./form/string-template"
import DateRangeExample from "./form/date-range"
import LineChartExample from "./chart/line-chart"
import PieExample from "./chart/pie"
import TextExample from "./display/text"
import RepeaterExample from "./display/repeater"
import ContainerExample from "./display/container"
import TableExample from "./display/table"
import PivotTableExample from "./display/pivot-table"
import DataInjectorExample from "./special/data-injector"
import DataBindingExample from "./framework/data-binding"
import TextTokensExample from "./framework/text-tokens"
import FormattersExample from "./framework/formatters"
import EventsExample from "./framework/events"
import TreeExample from "./display/tree"
import ModalExample from "./display/modal"

export function ExamplesView(): JSX.Element {
  const location = useLocation()
  const { path /*, url*/ } = useRouteMatch()
  console.log("ExamplesView", { path, location })
  return (
    <Layout>
      <Layout.Sider width={200} style={{ background: "#fff" }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["/examples"]}
          style={{ height: "100%", borderRight: 0 }}>
          <ChartMenu />
          <FormMenu />
          <DisplayMenu />
          <SpecialMenu />
          <FrameworkMenu />
        </Menu>
      </Layout.Sider>
      <Layout style={{ padding: "0 24px 24px" }}>
        <Switch>
          <Route exact path={path}>
            <ExamplesIntroView />
          </Route>

          <Route exact path={`${path}/chart`}>
            <h2>Chart Examples</h2>
          </Route>
          <Route path={`${path}/chart/line-chart`}>
            <LineChartExample />
          </Route>
          <Route path={`${path}/chart/pie`}>
            <PieExample />
          </Route>

          <Route exact path={`${path}/form`}>
            <h2>Form Examples</h2>
          </Route>
          <Route path={`${path}/form/button`}>
            <h2>Button Examples</h2>
            <ButtonExample />
          </Route>
          <Route path={`${path}/form/querybuilder`}>
            <QueryBuilderExample />
          </Route>
          <Route path={`${path}/form/date-stepper`}>
            <DateStepperExample />
          </Route>
          <Route path={`${path}/form/radio`}>
            <RadioExample />
          </Route>
          <Route path={`${path}/form/number`}>
            <NumberExample />
          </Route>
          <Route path={`${path}/form/number-range`}>
            <NumberRangeExample />
          </Route>
          <Route path={`${path}/form/string-template`}>
            <StringTemplateExample />
          </Route>
          <Route path={`${path}/form/date-range`}>
            <DateRangeExample />
          </Route>

          <Route exact path={`${path}/display`}>
            <h2>Display Examples</h2>
          </Route>
          <Route path={`${path}/display/text`}>
            <TextExample />
          </Route>
          <Route path={`${path}/display/repeater`}>
            <RepeaterExample />
          </Route>
          <Route path={`${path}/display/container`}>
            <ContainerExample />
          </Route>
          <Route path={`${path}/display/table`}>
            <TableExample />
          </Route>
          <Route path={`${path}/display/pivot-table`}>
            <PivotTableExample />
          </Route>
          <Route path={`${path}/display/tree`}>
            <TreeExample />
          </Route>
          <Route path={`${path}/display/modal`}>
            <ModalExample />
          </Route>

          <Route exact path={`${path}/special`}>
            <h2>Special Examples</h2>
          </Route>
          <Route path={`${path}/special/data-injector`}>
            <DataInjectorExample />
          </Route>

          <Route exact path={`${path}/framework`}>
            <h2>Framework Examples</h2>
          </Route>
          <Route path={`${path}/framework/data-binding`}>
            <DataBindingExample />
          </Route>
          <Route path={`${path}/framework/text-tokens`}>
            <TextTokensExample />
          </Route>
          <Route path={`${path}/framework/formatters`}>
            <FormattersExample />
          </Route>
          <Route path={`${path}/framework/events`}>
            <EventsExample />
          </Route>
        </Switch>
      </Layout>
    </Layout>
  )
}
