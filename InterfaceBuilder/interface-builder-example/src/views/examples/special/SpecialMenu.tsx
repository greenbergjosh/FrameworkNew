import { Menu } from "antd"
import { Link } from "react-router-dom"
import React from "react"
import { SubMenuProps } from "antd/lib/menu/SubMenu"

export const SpecialMenu = (props: SubMenuProps): JSX.Element => {
  return (
    <Menu.SubMenu {...props} key="/examples/special" title={<span>Special</span>}>
      <Menu.Item key="/examples/special/data-injector">
        <Link to="/examples/special/data-injector">Data Injector</Link>
      </Menu.Item>
    </Menu.SubMenu>
  )
}
