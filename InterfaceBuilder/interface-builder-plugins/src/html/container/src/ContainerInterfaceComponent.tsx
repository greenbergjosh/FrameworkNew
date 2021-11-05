import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { ContainerInterfaceComponentProps } from "./types"
import { settings } from "./settings"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"
import layoutDefinition from "./layoutDefinition"

export default class ContainerInterfaceComponent extends BaseInterfaceComponent<ContainerInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

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
