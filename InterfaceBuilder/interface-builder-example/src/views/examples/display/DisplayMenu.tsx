import { Menu } from "antd"
import { Link } from "react-router-dom"
import React from "react"
import { SubMenuProps } from "antd/lib/menu/SubMenu"

export const DisplayMenu = (props: SubMenuProps): JSX.Element => {
  return (
    <Menu.SubMenu {...props} key="/examples/display" title={<span>Display</span>}>
      <Menu.Item key="/examples/display/repeater">
        <Link to="/examples/display/repeater">Repeater</Link>
      </Menu.Item>
      <Menu.Item key="/examples/display/text">
        <Link to="/examples/display/text">Text</Link>
      </Menu.Item>
      <Menu.Item key="/examples/display/table">
        <Link to="/examples/display/table">Table</Link>
      </Menu.Item>
      <Menu.Item key="/examples/display/container">
        <Link to="/examples/display/container">Container</Link>
      </Menu.Item>
      <Menu.Item key="/examples/display/tree">
        <Link to="/examples/display/tree">Tree</Link>
      </Menu.Item>
      <Menu.Item key="/examples/display/modal">
        <Link to="/examples/display/modal">Modal</Link>
      </Menu.Item>
    </Menu.SubMenu>
  )
}
