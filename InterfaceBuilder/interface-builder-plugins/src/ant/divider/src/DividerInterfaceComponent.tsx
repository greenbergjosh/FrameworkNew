import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { Divider } from "antd"
import { DividerInterfaceComponentProps } from "./types"
import { dividerManageForm } from "./divider-manage-form"
import layoutDefinition from "./layoutDefinition"

export default class DividerInterfaceComponent extends BaseInterfaceComponent<DividerInterfaceComponentProps> {
  static defaultProps = {
    defaultValue: 0,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = dividerManageForm

  render(): JSX.Element {
    const { dashed, orientation, text, textAlignment } = this.props

    return text ? (
      <Divider dashed={dashed} type={orientation} orientation={textAlignment}>
        {text}
      </Divider>
    ) : (
      <Divider dashed={dashed} type={orientation} orientation={textAlignment} />
    )
  }
}
