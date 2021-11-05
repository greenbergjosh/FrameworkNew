import React from "react"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentRenderer,
  DataPathContext,
  LayoutDefinition,
} from "@opg/interface-builder"
import { RouteInterfaceComponentProps, RouteInterfaceComponentState } from "./types"
import { settings } from "./settings"
import { set } from "lodash/fp"
import layoutDefinition from "./layoutDefinition"

export default class RouteInterfaceComponent extends BaseInterfaceComponent<
  RouteInterfaceComponentProps,
  RouteInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }
  static manageForm = settings
  static availableEvents: []

  private handleChangeSchema() {
    return (newSchema: ComponentDefinition) => {
      if (this.props.mode === "edit") {
        this.props.onChangeSchema &&
          this.props.userInterfaceSchema &&
          this.props.onChangeSchema(set("components", newSchema, this.props.userInterfaceSchema))
      }
    }
  }

  render(): JSX.Element | null {
    return (
      <DataPathContext path="components">
        <ComponentRenderer
          components={this.props.components}
          data={this.props.userInterfaceData}
          getRootUserInterfaceData={this.props.getRootUserInterfaceData}
          onChangeData={this.props.onChangeData}
          onChangeRootData={this.props.onChangeRootData}
          onChangeSchema={this.handleChangeSchema}
        />
      </DataPathContext>
    )
  }
}
