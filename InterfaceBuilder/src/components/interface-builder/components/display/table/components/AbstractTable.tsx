import React from "react"
import { get, set } from "lodash/fp"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { editComponents } from "../config/edit-components"
import { TableInterfaceComponentEditModeProps } from "../types"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

interface AbstractTableProps extends Partial<TableInterfaceComponentEditModeProps> {
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
}

/**
 * Abstract Table
 * Defines a table to be used on child configs. Child configs
 * that use this table cannot edit the abstract table's
 * basic settings (settings popup), but may edit its columns.
 */
export function AbstractTable({
  onChangeData,
  userInterfaceData,
  getRootUserInterfaceData,
  valueKey,
}: AbstractTableProps): JSX.Element {
  const dataArray = get(valueKey!, userInterfaceData) || []
  const data = { columns: dataArray }

  return (
    <ComponentRenderer
      components={editComponents}
      data={data}
      getRootData={getRootUserInterfaceData}
      dragDropDisabled
      onChangeData={(newData) => {
        // console.log("TableInterfaceComponent.render", "onChangeData", { data, newData })
        onChangeData && onChangeData(set(valueKey!, newData.columns, userInterfaceData))
      }}
      onChangeSchema={(newData) => {
        console.log("TableInterfaceComponent.AbstractTable", "onChangeSchema X3", {
          data,
          newData,
        })
        // onChangeSchema &&
        //   userInterfaceSchema &&
        //   onChangeSchema(set("columns", newData.columns, userInterfaceSchema))
      }}
    />
  )
}
