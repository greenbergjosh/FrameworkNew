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

  /**
   *
   */
  static getSummary(props: Partial<ComponentDefinitionNamedProps>): JSX.Element | undefined {
    if (!props.dataSourceSettings) {
      return <div>ERROR: Can&rsquo;t read data connection settings.</div>
    }
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
    let dataSourceSettings: DataSourceSettingsModel

    switch (this.props.mode) {
      case "display":
        dataSourceSettings = this.getValue(this.props.valueKey)
        return (
          <DisplayMode
            dataSourceSettings={dataSourceSettings}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            showFieldList={this.props.showFieldList}
            showGroupingBar={this.props.showGroupingBar}
            exportExcel={this.props.exportExcel}
            exportPDF={this.props.exportPDF}
            exportCSV={this.props.exportCSV}
            onChange={(newSchema: DataSourceSettingsModel) => {
              this.setValue([this.props.valueKey, newSchema])
            }}
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
            onChange={(newSchema) => {
              if (this.props.mode === "edit") {
                debugger
                const { onChangeSchema, userInterfaceSchema } = this.props
                onChangeSchema &&
                  userInterfaceSchema &&
                  onChangeSchema(set("dataSourceSettings", newSchema, userInterfaceSchema))
              }
            }}
          />
        )
      default:
        // "preview" mode
        dataSourceSettings = this.getValue(this.props.valueKey)
        return (
          <DisplayMode
            dataSourceSettings={dataSourceSettings}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            showFieldList={this.props.showFieldList}
            showGroupingBar={this.props.showGroupingBar}
            exportExcel={this.props.exportExcel}
            exportPDF={this.props.exportPDF}
            exportCSV={this.props.exportCSV}
            name={this.props.name}
            onChange={() => void 0}
          />
        )
    }
  }
}
