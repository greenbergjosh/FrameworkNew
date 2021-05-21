import React from "react"
import { set } from "lodash/fp"
import { ComponentRenderer } from "../../../../components/ComponentRenderer/ComponentRenderer"
import { DataPathContext } from "../../../../contexts/DataPathContext"
import { editComponents } from "../config/edit-components"
import { EditTableProps } from "../types"

/**
 * Edit Table
 * User may define the columns with data types, etc.
 */
export function EditTable({
  onChangeSchema,
  rowDetails,
  userInterfaceData,
  getRootUserInterfaceData,
  setRootUserInterfaceData,
  getValue,
  setValue,
  userInterfaceSchema,
  valueKey,
}: EditTableProps): JSX.Element {
  const dataArray = getValue(valueKey!, userInterfaceData) || []
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
        getRootData={getRootUserInterfaceData}
        setRootData={setRootUserInterfaceData}
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
            getRootData={getRootUserInterfaceData}
            setRootData={setRootUserInterfaceData}
            onChangeData={(newData) => {
              setValue(valueKey!, newData, userInterfaceData)
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
