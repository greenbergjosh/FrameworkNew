import React from "react"
import { BaseInterfaceComponent, LayoutDefinition, Undraggable } from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"
import { ModelDataSource, PivotTableInterfaceComponentProps, PivotTableInterfaceComponentState } from "./types"
import { settings } from "./settings"
import { isEqual } from "lodash/fp"

export default class PivotTableInterfaceComponent extends BaseInterfaceComponent<
  PivotTableInterfaceComponentProps,
  PivotTableInterfaceComponentState
> {
  static defaultProps = {}

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  constructor(props: PivotTableInterfaceComponentProps) {
    super(props)

    this.state = {
      modelDataSource: undefined,
    }
  }

  componentDidMount() {
    const nextModelDataSource = this.getValue(this.props.valueKey) as ModelDataSource | undefined
    if (nextModelDataSource) {
      this.setState({ modelDataSource: nextModelDataSource })
    }
  }

  componentDidUpdate(prevProps: Readonly<PivotTableInterfaceComponentProps>): void {
    const prevModelDataSource = this.getValue(
      prevProps.valueKey,
      prevProps.userInterfaceData,
      prevProps.getRootUserInterfaceData
    )
    const nextModelDataSource = this.getValue(this.props.valueKey) as ModelDataSource | undefined
    if (!isEqual(prevModelDataSource, nextModelDataSource)) {
      this.setState({ modelDataSource: nextModelDataSource })
    }
  }

  /**
   *
   */
  static getSummary(props: Partial<PivotTableInterfaceComponentProps>): JSX.Element | undefined {
    if (!props.settingsDataSource) {
      return <div>ERROR: Can&rsquo;t read data connection settings.</div>
    }
    const { catalog, cube, providerType, url, localeIdentifier } = props.settingsDataSource
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

    switch (overrideMode || this.props.mode) {
      case "display":
        return (
          <DisplayMode
            allowCalculatedField={this.props.allowCalculatedField}
            allowConditionalFormatting={this.props.allowConditionalFormatting}
            allowDeferLayoutUpdate={this.props.allowDeferLayoutUpdate}
            allowExcelExport={this.props.allowExcelExport}
            allowNumberFormatting={this.props.allowNumberFormatting}
            allowPdfExport={this.props.allowPdfExport}
            enableValueSorting={this.props.enableValueSorting}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            modelDataSource={this.state.modelDataSource}
            name={this.props.name}
            onChangeModelDataSource={(newModelDataSource: ModelDataSource) => {
              this.setValue([this.props.valueKey, newModelDataSource])
            }}
            openFieldList={this.props.openFieldList}
            proxyUrl={proxyUrl}
            settingsDataSource={this.props.settingsDataSource}
            showChartsMenu={this.props.showChartsMenu}
            showGrandTotalMenu={this.props.showGrandTotalMenu}
            showGroupingBar={this.props.showGroupingBar}
            showMdxButton={this.props.showMdxButton}
            showSubTotalMenu={this.props.showSubTotalMenu}
            showToolbar={this.props.showToolbar}
            useProxy={useProxy}
          />
        )
      case "edit":
        return (
          <EditMode
            allowCalculatedField={this.props.allowCalculatedField}
            allowDeferLayoutUpdate={this.props.allowDeferLayoutUpdate}
            modelDataSource={this.state.modelDataSource}
            name={this.props.name}
            onChangeModelDataSource={(newModelDataSource) => {
              this.setValue([this.props.valueKey, newModelDataSource])
            }}
            proxyUrl={proxyUrl}
            settingsDataSource={this.props.settingsDataSource}
            useProxy={useProxy}
          />
        )
      default:
        // "preview" mode
        return (
          <DisplayMode
            allowCalculatedField={this.props.allowCalculatedField}
            allowConditionalFormatting={this.props.allowConditionalFormatting}
            allowDeferLayoutUpdate={this.props.allowDeferLayoutUpdate}
            allowExcelExport={this.props.allowExcelExport}
            allowNumberFormatting={this.props.allowNumberFormatting}
            allowPdfExport={this.props.allowPdfExport}
            enableValueSorting={this.props.enableValueSorting}
            enableVirtualization={this.props.enableVirtualization}
            height={this.props.height}
            heightKey={this.props.heightKey}
            modelDataSource={this.state.modelDataSource}
            name={this.props.name}
            onChangeModelDataSource={() => void 0}
            openFieldList={this.props.openFieldList}
            proxyUrl={proxyUrl}
            settingsDataSource={this.props.settingsDataSource}
            showChartsMenu={this.props.showChartsMenu}
            showGrandTotalMenu={this.props.showGrandTotalMenu}
            showGroupingBar={this.props.showGroupingBar}
            showMdxButton={this.props.showMdxButton}
            showSubTotalMenu={this.props.showSubTotalMenu}
            showToolbar={this.props.showToolbar}
            useProxy={useProxy}
          />
        )
    }
  }
}
