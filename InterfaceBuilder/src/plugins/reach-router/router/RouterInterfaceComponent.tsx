import React from "react"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { DisplayMode } from "plugins/reach-router/router/components/DisplayMode"
import { EditMode } from "plugins/reach-router/router/components/EditMode"
import { LayoutDefinition } from "globalTypes"
import { RouterInterfaceComponentProps, RouterInterfaceComponentState } from "./types"
import { routerManageForm } from "./router-manage-form"

export class RouterInterfaceComponent extends BaseInterfaceComponent<
  RouterInterfaceComponentProps,
  RouterInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Special",
      name: "router",
      title: "Router",
      icon: "deployment-unit",
      componentDefinition: {
        component: "router",
        components: [],
      },
    }
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
