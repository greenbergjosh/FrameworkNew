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
        <Menu.Item key="/examples/form">
          <Link to="/examples/form">Form</Link>
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
      </Menu.SubMenu>
    </Menu>
  )
}
