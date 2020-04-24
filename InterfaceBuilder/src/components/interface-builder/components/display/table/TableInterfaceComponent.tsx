import React from "react"
import { ColumnModel } from "@syncfusion/ej2-react-grids"
import { ComponentRendererModeContext } from "../../../ComponentRenderer"
import { tableManageForm } from "./table-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { TableInterfaceComponentProps } from "./types"
import { EditTable } from "./components/EditTable"
import { DisplayTable } from "./components/DisplayTable"
import { AbstractTable } from "./components/AbstractTable"

export class TableInterfaceComponent extends BaseInterfaceComponent<TableInterfaceComponentProps> {
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

  render() {
    const {
      abstract,
      allowAdding,
      allowDeleting,
      allowEditing,
      columns,
      defaultCollapseAll,
      autoFitColumns,
      defaultPageSize,
      loadingKey = "loading",
      onChangeData,
      rowDetails,
      userInterfaceData,
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
                valueKey={valueKey}
              />
            )
          } else {
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
                    allowAdding={allowAdding}
                    allowEditing={allowEditing}
                    columns={columns}
                    defaultCollapseAll={defaultCollapseAll}
                    autoFitColumns={autoFitColumns}
                    defaultPageSize={defaultPageSize}
                    loadingKey={loadingKey}
                    onChangeData={onChangeData}
                    rowDetails={rowDetails}
                    userInterfaceData={userInterfaceData}
                    valueKey={valueKey}
                  />
                )
              }
            }
          }
        }}
      </ComponentRendererModeContext.Consumer>
    )
  }
}
