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
import { getProxiedDataSourceSettings } from "lib/dataSourceUtils"

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

  render(): JSX.Element | null {
    const useProxy = this.props.useProxy || true
    const proxyUrl = this.props.proxyUrl || "https://adminapi.data.techopg.com/cube"
    const persistedDataSourceSettings = this.getValue(this.props.valueKey) as DataSourceSettingsModel | undefined
    if (!persistedDataSourceSettings) {
      return null
    }
    const dataSourceSettings = getProxiedDataSourceSettings({
      persistedDataSourceSettings,
      refreshSession: false,
      useProxy,
      proxyUrl,
    })

    switch (this.props.mode) {
      case "display":
        return (
          <DisplayMode
            dataSourceSettings={dataSourceSettings}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            openFieldList={this.props.openFieldList}
            showGroupingBar={this.props.showGroupingBar}
            exportExcel={this.props.exportExcel}
            exportPDF={this.props.exportPDF}
            exportCSV={this.props.exportCSV}
            onChange={(newSchema: DataSourceSettingsModel) => {
              this.setValue([this.props.valueKey, newSchema])
            }}
            proxyUrl={proxyUrl}
            useProxy={useProxy}
          />
        )
      case "edit":
        return (
          <EditMode
            dataSourceSettings={this.props.dataSourceSettings}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            openFieldList={this.props.openFieldList}
            proxyUrl={proxyUrl}
            showGroupingBar={this.props.showGroupingBar}
            onChange={(newSchema) => {
              if (this.props.mode === "edit") {
                const { onChangeSchema, userInterfaceSchema } = this.props
                onChangeSchema &&
                  userInterfaceSchema &&
                  onChangeSchema(set("dataSourceSettings", newSchema, userInterfaceSchema))
              }
            }}
            useProxy={useProxy}
          />
        )
      default:
        // "preview" mode
        return (
          <DisplayMode
            dataSourceSettings={dataSourceSettings}
            enableVirtualization={this.props.enableVirtualization}
            exportCSV={this.props.exportCSV}
            exportExcel={this.props.exportExcel}
            exportPDF={this.props.exportPDF}
            height={this.props.height}
            heightKey={this.props.heightKey}
            name={this.props.name}
            onChange={() => void 0}
            openFieldList={this.props.openFieldList}
            proxyUrl={proxyUrl}
            showGroupingBar={this.props.showGroupingBar}
            useProxy={useProxy}
          />
        )
    }
  }
}
