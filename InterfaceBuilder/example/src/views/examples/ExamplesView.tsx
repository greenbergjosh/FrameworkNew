import { Icon, Layout, Menu } from "antd"
import FormExample from "../examples/form"
import QueryBuilderExample from "../examples/querybuilder"
import RepeaterExample from "../examples/repeater"
import React from "react"
import { Link, Route, Switch, useRouteMatch } from "react-router-dom"
import { ExamplesIntroView } from "./ExamplesIntroView"

export function ExamplesView(): JSX.Element {
  const { path, url } = useRouteMatch()

  return (
    <Layout>
      <Layout.Sider width={200} style={{ background: "#fff" }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={[]}
          defaultOpenKeys={["sub1"]}
          style={{ height: "100%", borderRight: 0 }}>
          <Menu.SubMenu
            key="sub1"
            title={
              <span>
                <Icon type="play-circle" />
                Examples
              </span>
            }>
            <Menu.Item key="1">
              <Link to="/examples/form">Form</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/examples/repeater">Repeater</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/examples/querybuilder">QueryBuilder</Link>
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Layout.Sider>
      <Layout style={{ padding: "0 24px 24px" }}>
        <Switch>
          <Route exact path={path}>
            <ExamplesIntroView />
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
        </Switch>
      </Layout>
    </Layout>
  )
}
