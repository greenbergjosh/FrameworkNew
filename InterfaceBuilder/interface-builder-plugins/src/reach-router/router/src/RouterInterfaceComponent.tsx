import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"
import { RouterInterfaceComponentProps, RouterInterfaceComponentState } from "./types"
import { routerManageForm } from "./router-manage-form"
import layoutDefinition from "./layoutDefinition"

export default class RouterInterfaceComponent extends BaseInterfaceComponent<
  RouterInterfaceComponentProps,
  RouterInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }
  static manageForm = routerManageForm
  static availableEvents: []

  render(): JSX.Element | null {
    if (this.props.mode === "edit") {
      return (
        <div style={{ border: "solid 4px blue" }}>
          <EditMode
            components={this.props.components}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            mode={"edit"}
            onChangeData={this.props.onChangeData}
            onChangeRootData={this.props.onChangeRootData}
            onChangeSchema={() => void 0}
            rootUserInterfaceData={this.props.getRootUserInterfaceData}
            userInterfaceData={this.props.userInterfaceData}
          />
        </div>
      )
    }
    return (
      <div style={{ border: "solid 4px blue" }}>
        <DisplayMode
          components={this.props.components}
          getRootUserInterfaceData={this.props.getRootUserInterfaceData}
          mode={this.props.mode}
          onChangeData={this.props.onChangeData}
          onChangeRootData={this.props.onChangeRootData}
          onChangeSchema={() => void 0}
          rootUserInterfaceData={this.props.getRootUserInterfaceData}
          userInterfaceData={this.props.userInterfaceData}
        />
      </div>
    )
  }
}
