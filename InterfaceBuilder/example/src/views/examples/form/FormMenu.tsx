import { Menu } from "antd"
import { Link } from "react-router-dom"
import React from "react"
import { SubMenuProps } from "antd/lib/menu/SubMenu"

export const FormMenu = (props: SubMenuProps): JSX.Element => {
  return (
    <Menu.SubMenu {...props} key="/examples/form" title={<span>Form</span>}>
      <Menu.Item key="/examples/form/button">
        <Link to="/examples/form/button">Button</Link>
      </Menu.Item>
      <Menu.Item key="/examples/form/date-range">
        <Link to="/examples/form/date-range">Date Range</Link>
      </Menu.Item>
      <Menu.Item key="/examples/form/date-stepper">
        <Link to="/examples/form/date-stepper">Date Stepper</Link>
      </Menu.Item>
      <Menu.Item key="/examples/form/number">
        <Link to="/examples/form/number">Number</Link>
      </Menu.Item>
      <Menu.Item key="/examples/form/number-range">
        <Link to="/examples/form/number-range">Number Range</Link>
      </Menu.Item>
      <Menu.Item key="/examples/form/querybuilder">
        <Link to="/examples/form/querybuilder">QueryBuilder</Link>
      </Menu.Item>
      <Menu.Item key="/examples/form/radio">
        <Link to="/examples/form/radio">Radio</Link>
      </Menu.Item>
      <Menu.Item key="/examples/form/string-template">
        <Link to="/examples/form/string-template">String Template</Link>
      </Menu.Item>
    </Menu.SubMenu>
  )
}
