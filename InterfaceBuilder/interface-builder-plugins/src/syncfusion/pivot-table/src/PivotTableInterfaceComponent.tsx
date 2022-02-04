import React from "react"
import { BaseInterfaceComponent, LayoutDefinition, Undraggable } from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"
import { ModelDataSource, PivotTableInterfaceComponentProps, PivotTableInterfaceComponentState } from "./types"
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
  static getSummary(props: Partial<PivotTableInterfaceComponentProps>): JSX.Element | undefined {
    if (!props.dataSourceSettings) {
      return <div>ERROR: Can&rsquo;t read data connection settings.</div>
    }
    const { catalog, cube, providerType, url, localeIdentifier } = props.dataSourceSettings
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
    const overrideMode = this.props.overrideMode !== "default" ? this.props.overrideMode : undefined
    const modelDataSource = this.getValue(this.props.valueKey) as ModelDataSource | undefined

    switch (overrideMode || this.props.mode) {
      case "display":
        return (
          <DisplayMode
            allowCalculatedField={this.props.allowCalculatedField}
            enableVirtualization={this.props.enableVirtualization}
            exportCSV={this.props.exportCSV}
            exportExcel={this.props.exportExcel}
            exportPDF={this.props.exportPDF}
            height={this.props.height}
            heightKey={this.props.heightKey}
            modelDataSource={modelDataSource}
            name={this.props.name}
            onChange={(newModelDataSource: ModelDataSource) => {
              this.setValue([this.props.valueKey, newModelDataSource])
            }}
            openFieldList={this.props.openFieldList}
            proxyUrl={proxyUrl}
            settingsDataSource={this.props.dataSourceSettings}
            showGroupingBar={this.props.showGroupingBar}
            useProxy={useProxy}
          />
        )
      case "edit":
        return (
          <EditMode
            allowCalculatedField={this.props.allowCalculatedField}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            modelDataSource={modelDataSource}
            name={this.props.name}
            onChange={(newModelDataSource) => {
              this.setValue([this.props.valueKey, newModelDataSource])
            }}
            openFieldList={this.props.openFieldList}
            outboundValueKey={this.props.valueKey}
            proxyUrl={proxyUrl}
            settingsDataSource={this.props.dataSourceSettings}
            showGroupingBar={this.props.showGroupingBar}
            useProxy={useProxy}
          />
        )
      default:
        // "preview" mode
        return (
          <DisplayMode
            allowCalculatedField={this.props.allowCalculatedField}
            enableVirtualization={this.props.enableVirtualization}
            exportCSV={this.props.exportCSV}
            exportExcel={this.props.exportExcel}
            exportPDF={this.props.exportPDF}
            height={this.props.height}
            heightKey={this.props.heightKey}
            modelDataSource={modelDataSource}
            name={this.props.name}
            onChange={() => void 0}
            openFieldList={this.props.openFieldList}
            proxyUrl={proxyUrl}
            settingsDataSource={this.props.dataSourceSettings}
            showGroupingBar={this.props.showGroupingBar}
            useProxy={useProxy}
          />
        )
    }
  }
}
