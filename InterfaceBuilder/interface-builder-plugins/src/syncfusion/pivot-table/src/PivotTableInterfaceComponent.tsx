import React from "react"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps, LayoutDefinition } from "@opg/interface-builder"
import { PivotTableInterfaceComponentProps, PivotTableInterfaceComponentState } from "./types"
import { settings } from "./settings"
import layoutDefinition from "./layoutDefinition"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"

export default class PivotTableInterfaceComponent extends BaseInterfaceComponent<
  PivotTableInterfaceComponentProps,
  PivotTableInterfaceComponentState
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  /**
   *
   */
  static getSummary(props: Partial<ComponentDefinitionNamedProps>): JSX.Element | undefined {
    return (
      <>
        <div>
          <strong>Catalog:</strong> {props.catalog}
        </div>
        <div>
          <strong>Cube:</strong> {props.cube}
        </div>
        <div>
          <strong>Provider Type:</strong> {props.providerType}
        </div>
        <div>
          <strong>URL:</strong> {props.url}
        </div>
        <div>
          <strong>Locale:</strong> {props.localeIdentifier}
        </div>
      </>
    )
  }

  componentDidUpdate(prevProps: Readonly<PivotTableInterfaceComponentProps>): void {}

  render(): JSX.Element {
    switch (this.props.mode) {
      case "display":
        return (
          <DisplayMode
            //
            // Datasource props
            catalog={this.props.catalog}
            cube={this.props.cube}
            enableSorting={this.props.enableSorting}
            localeIdentifier={this.props.localeIdentifier}
            providerType={this.props.providerType}
            url={this.props.url}
            //
            // Options
            showFieldList={this.props.showFieldList}
            //
            // Mapped props
            columns={this.props.columns}
            filters={this.props.filters}
            rows={this.props.rows}
            values={this.props.values}
            //
            // Mapped Settings props
            calculatedFieldSettings={this.props.calculatedFieldSettings}
            filterSettings={this.props.filterSettings}
            formatSettings={this.props.formatSettings}
            //
            // Appearance props
            height={this.props.height}
          />
        )
      case "edit":
        return (
          <EditMode
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            onChangeRootData={this.props.onChangeRootData}
            onChangeSchema={this.props.onChangeSchema}
            userInterfaceSchema={this.props.userInterfaceSchema}
          />
        )
    }
  }
}
