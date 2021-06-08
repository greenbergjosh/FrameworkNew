import { Menu } from "antd"
import { Link } from "react-router-dom"
import React from "react"
import { SubMenuProps } from "antd/lib/menu/SubMenu"

export const ChartMenu = (props: SubMenuProps): JSX.Element => {
  return (
    <Menu.SubMenu {...props} key="/examples/chart" title={<span>Chart</span>}>
      <Menu.Item key="/examples/chart/line-chart">
        <Link to="/examples/chart/line-chart">Line Chart</Link>
      </Menu.Item>
    </Menu.SubMenu>
  )
}
