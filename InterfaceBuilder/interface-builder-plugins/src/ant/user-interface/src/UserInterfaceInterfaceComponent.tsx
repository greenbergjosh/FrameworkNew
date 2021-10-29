import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { userInterfaceManageForm } from "./user-interface-manage-form"
import layoutDefinition from "./layoutDefinition"
import { UserInterfaceWrapper } from "components/UserInterfaceWrapper"
import { UserInterfaceInterfaceComponentProps } from "./types"

export default class UserInterfaceInterfaceComponent extends BaseInterfaceComponent<UserInterfaceInterfaceComponentProps> {
  static defaultProps = {
    defaultDataValue: {},
    defaultValue: [],
    mode: "edit",
    valueKey: "layout",
    hideMenu: false,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = userInterfaceManageForm

  constructor(props: UserInterfaceInterfaceComponentProps) {
    super(props)
  }

  render(): JSX.Element {
    return (
      <UserInterfaceWrapper
        userInterfaceData={this.props.userInterfaceData}
        defaultValue={this.props.defaultValue}
        getRootUserInterfaceData={this.props.getRootUserInterfaceData}
        getValue={this.getValue.bind(this)}
        hideMenu={this.props.hideMenu}
        label={this.props.label}
        mode={this.props.mode}
        onChangeRootData={this.props.onChangeRootData}
        setValue={this.setValue.bind(this)}
        submit={this.props.submit}
        valueKey={this.props.valueKey}
      />
    )
  }
}
