import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { ContainerInterfaceComponentProps } from "./types"
import { containerManageForm } from "./container-manage-form"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"
import layoutDefinition from "./layoutDefinition"

export default class ContainerInterfaceComponent extends BaseInterfaceComponent<ContainerInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = containerManageForm

  render(): JSX.Element | undefined {
    switch (this.props.mode) {
      case "display": {
        return <DisplayMode {...this.props} cssPrefix={this.props.cssPrefix} />
      }
      case "preview": {
        return <DisplayMode {...this.props} cssPrefix={this.props.cssPrefix} />
      }
      case "edit": {
        return <EditMode {...this.props} cssPrefix={this.props.cssPrefix} />
      }
    }
  }
}
