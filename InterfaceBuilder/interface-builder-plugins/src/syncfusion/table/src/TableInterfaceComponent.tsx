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
import { isBoolean } from "lodash/fp"
import { TableInterfaceComponentProps, TableInterfaceComponentState } from "./types"
import { settings } from "./settings"
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

  static manageForm = settings

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
      autoFitColumns,
      columns,
      defaultCollapseAll,
      defaultPageSize,
      enableAltRow,
      enableVirtualization,
      filterByKey,
      getRootUserInterfaceData,
      groupByKey,
      height,
      onChangeRootData,
      orderByKey,
      pagingKey,
      preview,
      rowDetails,
      showToolbar,
      userInterfaceData,
      useSmallFont,
      useSmallPager,
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
                  <DisplayTable
                    autoFitColumns={autoFitColumns}
                    columns={columns}
                    defaultCollapseAll={defaultCollapseAll}
                    defaultPageSize={defaultPageSize}
                    enableAltRow={enableAltRow}
                    enableVirtualization={enableVirtualization}
                    filterByKey={filterByKey}
                    getRootUserInterfaceData={getRootUserInterfaceData}
                    getValue={this.getValue.bind(this)}
                    groupByKey={groupByKey}
                    height={height}
                    onChangeRootData={onChangeRootData}
                    orderByKey={orderByKey}
                    pagingKey={pagingKey}
                    preview={preview}
                    rowDetails={rowDetails}
                    setValue={this.setValue.bind(this)}
                    showToolbar={showToolbar}
                    userInterfaceData={userInterfaceData}
                    useSmallFont={useSmallFont}
                    useSmallPager={useSmallPager}
                    valueKey={valueKey}
                  />
                )
              }
            }
          }
        }
      </ComponentRendererModeContext.Consumer>
    )
  }
}
