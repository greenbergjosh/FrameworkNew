import React from "react"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  Undraggable,
} from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"
import { DataSourceSettingsModel } from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"
import { PivotTableInterfaceComponentProps, PivotTableInterfaceComponentState } from "./types"
import { set } from "lodash/fp"
import { settings } from "./settings"

export default class PivotTableInterfaceComponent extends BaseInterfaceComponent<
  PivotTableInterfaceComponentProps,
  PivotTableInterfaceComponentState
> {
  static defaultProps = {}

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  private handleChange = (newSchema: DataSourceSettingsModel) => {
    if (this.props.mode === "edit") {
      this.props.onChangeSchema &&
        this.props.userInterfaceSchema &&
        this.props.onChangeSchema(set("dataSourceSettings", newSchema, this.props.userInterfaceSchema))
    }
  }

  /**
   *
   */
  static getSummary(props: Partial<ComponentDefinitionNamedProps>): JSX.Element | undefined {
    const { catalog, cube, providerType, url, localeIdentifier } = props.dataSourceSettings as DataSourceSettingsModel
    return (
      <Undraggable>
        <div>
          <strong>Catalog:</strong> {catalog}
        </div>
        <div>
          <strong>Cube:</strong> {cube}
        </div>
        <div>
          <strong>Provider Type:</strong> {providerType}
        </div>
        <div>
          <strong>URL:</strong> {url}
        </div>
        <div>
          <strong>Locale:</strong> {localeIdentifier}
        </div>
      </Undraggable>
    )
  }

  render(): JSX.Element {
    switch (this.props.mode) {
      case "display":
        return (
          <DisplayMode
            dataSourceSettings={this.props.dataSourceSettings}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            showFieldList={this.props.showFieldList}
            showGroupingBar={this.props.showGroupingBar}
          />
        )
      case "edit":
        return (
          <EditMode
            dataSourceSettings={this.props.dataSourceSettings}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            showFieldList={this.props.showFieldList}
            showGroupingBar={this.props.showGroupingBar}
            onChange={this.handleChange}
          />
        )
      default:
        // "preview" mode
        return (
          <DisplayMode
            dataSourceSettings={this.props.dataSourceSettings}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            showFieldList={this.props.showFieldList}
            showGroupingBar={this.props.showGroupingBar}
          />
        )
    }
  }
}
