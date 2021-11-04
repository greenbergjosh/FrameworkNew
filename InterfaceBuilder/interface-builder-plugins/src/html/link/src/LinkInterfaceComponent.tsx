import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { LinkInterfaceComponentProps } from "./types"
import { linkManageForm } from "./link-manage-form"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"
import layoutDefinition from "./layoutDefinition"

export default class LinkInterfaceComponent extends BaseInterfaceComponent<LinkInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = linkManageForm

  render(): JSX.Element {
    if (this.props.mode === "edit") {
      return <EditMode {...this.props} cssPrefix={this.props.cssPrefix} />
    }
    return <DisplayMode {...this.props} cssPrefix={this.props.cssPrefix} />
  }
}
