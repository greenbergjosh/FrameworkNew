import React from "react"
import { Link } from "react-router-dom"
import { Menu } from "antd"
import { SubMenuProps } from "antd/lib/menu/SubMenu"

export const FrameworkMenu = (props: SubMenuProps): JSX.Element => {
  return (
    <Menu.SubMenu {...props} key="/examples/framework" title={<span>Framework</span>}>
      <Menu.Item key="/examples/framework/text-tokens">
        <Link to="/examples/framework/text-tokens">Text Tokens</Link>
      </Menu.Item>
      <Menu.Item key="/examples/framework/formatters">
        <Link to="/examples/framework/formatters">Formatters</Link>
      </Menu.Item>
      <Menu.Item key="/examples/framework/data-binding">
        <Link to="/examples/framework/data-binding">Data Binding</Link>
      </Menu.Item>
      <Menu.Item key="/examples/framework/events">
        <Link to="/examples/framework/events">Events</Link>
      </Menu.Item>
    </Menu.SubMenu>
  )
}
