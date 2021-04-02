import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Icon, Menu } from "antd"

export const ExamplesMenu: React.FC = () => {
  const location = useLocation()

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={["/examples"]}
      style={{ height: "100%", borderRight: 0 }}>
      <Menu.SubMenu
        key="/examples"
        title={
          <span>
            <Icon type="play-circle" />
            Examples
          </span>
        }>
        <Menu.Item key="/examples/button">
          <Link to="/examples/button">Button</Link>
        </Menu.Item>
        <Menu.Item key="/examples/repeater">
          <Link to="/examples/repeater">Repeater</Link>
        </Menu.Item>
        <Menu.Item key="/examples/querybuilder">
          <Link to="/examples/querybuilder">QueryBuilder</Link>
        </Menu.Item>
        <Menu.Item key="/examples/data-injector">
          <Link to="/examples/data-injector">Data Injector</Link>
        </Menu.Item>
        <Menu.Item key="/examples/text">
          <Link to="/examples/text">Text</Link>
        </Menu.Item>
        <Menu.Item key="/examples/date-stepper">
          <Link to="/examples/date-stepper">Date Stepper</Link>
        </Menu.Item>
        <Menu.Item key="/examples/date-range">
          <Link to="/examples/date-range">Date Range</Link>
        </Menu.Item>
        <Menu.Item key="/examples/table">
          <Link to="/examples/table">Table</Link>
        </Menu.Item>
        <Menu.Item key="/examples/prop-tokens">
          <Link to="/examples/prop-tokens">Prop Tokens</Link>
        </Menu.Item>
        <Menu.Item key="/examples/radio">
          <Link to="/examples/radio">Radio</Link>
        </Menu.Item>
        <Menu.Item key="/examples/data-binding">
          <Link to="/examples/data-binding">Data Binding</Link>
        </Menu.Item>
        <Menu.Item key="/examples/line-chart">
          <Link to="/examples/line-chart">Line Chart</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  )
}
