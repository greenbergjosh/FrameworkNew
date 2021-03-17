import React from "react"
import { ComponentRendererModeContext } from "../../../ComponentRenderer"
import { tableManageForm } from "./table-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { TableInterfaceComponentProps, TableInterfaceComponentState } from "./types"
import { EditTable } from "./components/EditTable"
import DisplayTable from "./components/DisplayTable"
import { AbstractTable } from "./components/AbstractTable"
import { isBoolean } from "lodash/fp"
import { Spin, Icon } from "antd"

export class TableInterfaceComponent extends BaseInterfaceComponent<
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

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "table",
      title: "Table",
      icon: "table",
      componentDefinition: {
        component: "table",
        columns: [],
        rowDetails: [],
      },
    }
  }

  static manageForm = tableManageForm

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

  render() {
    const {
      abstract,
      allowAdding,
      allowDeleting,
      allowEditing,
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
      onChangeData,
      rowDetails,
      userInterfaceData,
      getRootUserInterfaceData,
      preview,
      valueKey,
    } = this.props

    return (
      <ComponentRendererModeContext.Consumer>
        {(mode) => {
          console.log("TableInterfaceComponent.render", { props: this.props, mode })

          if (abstract) {
            /*
             * Abstract Table
             * Defines a table to be used on child configs. Child configs
             * that use this table cannot edit the abstract table's
             * basic settings (settings popup), but may edit its columns.
             */
            return (
              <AbstractTable
                onChangeData={onChangeData}
                userInterfaceData={userInterfaceData}
                getRootUserInterfaceData={getRootUserInterfaceData}
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
                  onChangeData={onChangeData}
                  onChangeSchema={this.props.onChangeSchema}
                  rowDetails={rowDetails}
                  userInterfaceData={userInterfaceData}
                  getRootUserInterfaceData={getRootUserInterfaceData}
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
                    allowAdding={allowAdding}
                    allowDeleting={allowDeleting}
                    allowEditing={allowEditing}
                    columns={columns}
                    defaultCollapseAll={defaultCollapseAll}
                    autoFitColumns={autoFitColumns}
                    useSmallFont={useSmallFont}
                    enableAltRow={enableAltRow}
                    enableVirtualization={enableVirtualization}
                    height={height}
                    defaultPageSize={defaultPageSize}
                    onChangeData={onChangeData}
                    rowDetails={rowDetails}
                    userInterfaceData={userInterfaceData}
                    getRootUserInterfaceData={getRootUserInterfaceData}
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
        }}
      </ComponentRendererModeContext.Consumer>
    )
  }
}
