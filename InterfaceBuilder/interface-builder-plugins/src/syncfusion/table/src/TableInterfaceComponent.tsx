import React from "react"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentRendererModeContext,
  LayoutDefinition,
} from "@opg/interface-builder"
import DisplayTable from "./components/DisplayTable"
import { AbstractTable } from "./components/AbstractTable"
import { EditTable } from "./components/EditTable"
import { Icon, Spin } from "antd"
import { isBoolean } from "lodash/fp"
import { TableInterfaceComponentProps, TableInterfaceComponentState } from "./types"
import { tableManageForm } from "./table-manage-form"
import layoutDefinition from "./layoutDefinition"

export default class TableInterfaceComponent extends BaseInterfaceComponent<
  TableInterfaceComponentProps,
  TableInterfaceComponentState
> {
  constructor(props: TableInterfaceComponentProps) {
    super(props)

    this.state = {
      loading: false,
    }
  }
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
    showBorder: true,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = tableManageForm

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

  componentDidUpdate(prevProps: Readonly<TableInterfaceComponentProps>): void {
    if (this.props.mode === "display") {
      const prevLoadingValue = prevProps.loadingKey
        ? this.getValue(prevProps.loadingKey, prevProps.userInterfaceData, prevProps.getRootUserInterfaceData)
        : false
      const nextLoadingValue = this.props.loadingKey ? this.getValue(this.props.loadingKey) : false
      const prevLoading = isBoolean(prevLoadingValue) ? prevLoadingValue : false
      const nextLoading = isBoolean(nextLoadingValue) ? nextLoadingValue : false

      if (prevLoading !== nextLoading) {
        this.setState({ loading: nextLoading })
      }
    }
  }

  render(): JSX.Element {
    const {
      abstract,
      columns,
      showToolbar,
      useSmallPager,
      defaultCollapseAll,
      autoFitColumns,
      useSmallFont,
      enableAltRow,
      enableVirtualization,
      height,
      defaultPageSize,
      rowDetails,
      userInterfaceData,
      getRootUserInterfaceData,
      onChangeRootData,
      preview,
      valueKey,
    } = this.props

    return (
      <ComponentRendererModeContext.Consumer>
        {
          (/* mode */) => {
            if (abstract) {
              /*
               * Abstract Table
               * Defines a table to be used on child configs. Child configs
               * that use this table cannot edit the abstract table's
               * basic settings (settings popup), but may edit its columns.
               */
              return (
                <AbstractTable
                  getRootUserInterfaceData={getRootUserInterfaceData}
                  onChangeRootData={onChangeRootData}
                  getValue={this.getValue.bind(this)}
                  setValue={this.setValue.bind(this)}
                  valueKey={valueKey}
                />
              )
            }
            switch (this.props.mode) {
              case "edit": {
                /*
                 * Edit Mode
                 * User defines columns with data types, etc.
                 */
                return (
                  <EditTable
                    onChangeSchema={this.props.onChangeSchema}
                    rowDetails={rowDetails}
                    getRootUserInterfaceData={getRootUserInterfaceData}
                    onChangeRootData={onChangeRootData}
                    getValue={this.getValue.bind(this)}
                    setValue={this.setValue.bind(this)}
                    userInterfaceSchema={this.props.userInterfaceSchema}
                    valueKey={valueKey}
                  />
                )
              }
              case "display": {
                /*
                 * Display Mode
                 * View the actual grid with data.
                 */
                return (
                  <Spin
                    spinning={this.state.loading}
                    indicator={<Icon type="loading" style={{ color: "rgba(0, 0, 0, 0.65)" }} />}>
                    <DisplayTable
                      columns={columns}
                      defaultCollapseAll={defaultCollapseAll}
                      autoFitColumns={autoFitColumns}
                      useSmallFont={useSmallFont}
                      enableAltRow={enableAltRow}
                      enableVirtualization={enableVirtualization}
                      height={height}
                      defaultPageSize={defaultPageSize}
                      rowDetails={rowDetails}
                      userInterfaceData={userInterfaceData}
                      getRootUserInterfaceData={getRootUserInterfaceData}
                      onChangeRootData={onChangeRootData}
                      getValue={this.getValue.bind(this)}
                      setValue={this.setValue.bind(this)}
                      valueKey={valueKey}
                      preview={preview}
                      showToolbar={showToolbar}
                      useSmallPager={useSmallPager}
                    />
                  </Spin>
                )
              }
            }
          }
        }
      </ComponentRendererModeContext.Consumer>
    )
  }
}
