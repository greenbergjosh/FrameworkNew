import React from "react"
import { ComponentRenderer } from "../../../../components/ComponentRenderer/ComponentRenderer"
import { editComponents } from "../config/edit-components"
import { AbstractTableProps } from "../types"

/**
 * Abstract Table
 * Defines a table to be used on child configs. Child configs
 * that use this table cannot edit the abstract table's
 * basic settings (settings popup), but may edit its columns.
 */
export function AbstractTable({
  userInterfaceData,
  getRootUserInterfaceData,
  setRootUserInterfaceData,
  getValue,
  setValue,
  valueKey,
}: AbstractTableProps): JSX.Element {
  const dataArray = getValue(valueKey!, userInterfaceData) || []
  const data = { columns: dataArray }

  return (
    <ComponentRenderer
      components={editComponents}
      data={data}
      getRootData={getRootUserInterfaceData}
      setRootData={setRootUserInterfaceData}
      dragDropDisabled
      onChangeData={(newData) => {
        setValue(valueKey!, newData.columns, userInterfaceData)
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
