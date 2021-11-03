import React from "react"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps, LayoutDefinition } from "@opg/interface-builder"
import { PivotTableInterfaceComponentProps, PivotTableInterfaceComponentState } from "./types"
import { pivotTableManageForm } from "./pivot-table-manage-form"
import layoutDefinition from "./layoutDefinition"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"

export default class PivotTableInterfaceComponent extends BaseInterfaceComponent<
  PivotTableInterfaceComponentProps,
  PivotTableInterfaceComponentState
> {
  constructor(props: PivotTableInterfaceComponentProps) {
    super(props)

    this.state = {
      loading: false,
    }
  }
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = pivotTableManageForm

  /**
   *
   */
  static getSummary(props: Partial<ComponentDefinitionNamedProps>): JSX.Element | undefined {
    return (
      <>
        <div>
          <strong>API Key:</strong> {props.valueKey}
        </div>
        <div>
          <strong>Loading Key:</strong> {props.loadingKey}
        </div>
      </>
    )
  }

  componentDidUpdate(prevProps: Readonly<PivotTableInterfaceComponentProps>): void {}

  render(): JSX.Element {
    const data = this.getValue(this.props.valueKey)

    switch (this.props.mode) {
      case "display":
        return (
          <DisplayMode
            columns={this.props.columns}
            data={data}
            expandAll={this.props.expandAll}
            filters={this.props.filters}
            formatSettings={this.props.formatSettings}
            rows={this.props.rows}
            values={this.props.values}
            height={this.props.height}
          />
        )
      case "edit":
        return (
          <EditMode
            onChangeSchema={this.props.onChangeSchema}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            onChangeRootData={this.props.onChangeRootData}
            getValue={this.getValue.bind(this)}
            setValue={this.setValue.bind(this)}
            userInterfaceSchema={this.props.userInterfaceSchema}
            valueKey={this.props.valueKey}
          />
        )
    }
  }
}
