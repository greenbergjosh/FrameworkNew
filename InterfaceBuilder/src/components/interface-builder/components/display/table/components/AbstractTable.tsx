import React from "react"
import { get, set } from "lodash/fp"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { editComponents } from "../config/edit-components"
import { TableInterfaceComponentEditModeProps } from "../types"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

interface AbstractTableProps extends Partial<TableInterfaceComponentEditModeProps> {
  userInterfaceData: JSONRecord
}

/**
 * Abstract Table
 * Defines a table to be used on child configs. Child configs
 * that use this table cannot edit the abstract table's
 * basic settings (settings popup), but may edit its columns.
 */
export function AbstractTable({ onChangeData, userInterfaceData, valueKey }: AbstractTableProps) {
  const dataArray = get(valueKey!, userInterfaceData) || []
  const data = { columns: dataArray }

  return (
    <ComponentRenderer
      components={editComponents}
      data={data}
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
