import React from "react"
import { containerManageForm } from "./container-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { LayoutDefinition } from "../../../globalTypes"
import { ContainerInterfaceComponentProps } from "./types"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"

export class ContainerInterfaceComponent extends BaseInterfaceComponent<ContainerInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Display",
      name: "container",
      title: "Container",
      icon: "layout",
      componentDefinition: {
        classNames: ["container"],
        component: "container",
        components: [],
      },
    }
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
