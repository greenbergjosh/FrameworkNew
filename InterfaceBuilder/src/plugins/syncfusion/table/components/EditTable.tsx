import React from "react"
import { set } from "lodash/fp"
import { Typography } from "antd"
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
  getValue,
  setValue,
  userInterfaceSchema,
  valueKey,
}: EditTableProps): JSX.Element {
  const dataArray = getValue(valueKey!, userInterfaceData) || []
  const data = { columns: dataArray }

  return (
    <>
      <ComponentRenderer
        components={editComponents}
        data={userInterfaceSchema}
        getRootData={getRootUserInterfaceData}
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
      <Typography.Title level={4}>Row Details</Typography.Title>
      <div style={{ marginLeft: 15 }}>
        <DataPathContext path="rowDetails">
          <ComponentRenderer
            components={rowDetails}
            data={data}
            getRootData={getRootUserInterfaceData}
            onChangeData={(newData) => {
              setValue(valueKey!, newData, userInterfaceData)
            }}
            onChangeSchema={(newSchema) => {
              onChangeSchema && userInterfaceSchema && onChangeSchema(set("rowDetails", newSchema, userInterfaceSchema))
            }}
          />
        </DataPathContext>
      </div>
    </>
  )
}
