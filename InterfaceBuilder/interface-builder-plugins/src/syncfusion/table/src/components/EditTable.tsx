import React from "react"
import { ComponentRenderer, DataPathContext } from "@opg/interface-builder"
import { editComponents } from "../config/edit-components"
import { EditTableProps } from "../types"
import { set } from "lodash/fp"

/**
 * Edit Table
 * User may define the columns with data types, etc.
 */
export function EditTable({
  onChangeSchema,
  rowDetails = [],
  getRootUserInterfaceData,
  onChangeRootData,
  getValue,
  setValue,
  userInterfaceSchema,
  valueKey,
}: EditTableProps): JSX.Element {
  const dataArray = getValue(valueKey) || []
  const data = { columns: dataArray }

  return (
    <>
      {/* **************************
       *
       * Columns Editor
       */}
      <ComponentRenderer
        components={editComponents}
        data={userInterfaceSchema}
        getRootUserInterfaceData={getRootUserInterfaceData}
        onChangeRootData={onChangeRootData}
        mode="display"
        onChangeData={(newData) => {
          onChangeSchema && userInterfaceSchema && onChangeSchema(set("columns", newData.columns, userInterfaceSchema))
        }}
        onChangeSchema={(newData) => {
          console.log("TableInterfaceComponent.EditTable", "onChangeSchema X1", {
            data,
            newData,
            onChangeSchema,
            userInterfaceSchema,
          })
          // onChangeSchema &&
          //   userInterfaceSchema &&
          //   onChangeSchema(set("columns", newData.columns, userInterfaceSchema))
        }}
      />
      {/* **************************
       *
       * Row Details
       */}
      <fieldset
        style={{
          padding: 5,
          border: "1px dashed #a3a3a3",
          borderRadius: 5,
          position: "relative",
        }}>
        <legend style={{ all: "unset", padding: 5 }}>Row Details</legend>
        <DataPathContext path="rowDetails">
          <ComponentRenderer
            components={rowDetails}
            data={data}
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
            onChangeData={(newData) => {
              setValue([valueKey, newData])
            }}
            onChangeSchema={(newSchema) => {
              onChangeSchema && userInterfaceSchema && onChangeSchema(set("rowDetails", newSchema, userInterfaceSchema))
            }}
          />
        </DataPathContext>
      </fieldset>
    </>
  )
}
