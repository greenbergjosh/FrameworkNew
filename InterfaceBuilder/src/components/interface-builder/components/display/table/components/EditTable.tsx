import React from "react"
import { get, set } from "lodash/fp"
import { Typography } from "antd"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { DataPathContext } from "components/interface-builder/util/DataPathContext"
import { editComponents } from "../config/edit-components"
import { TableInterfaceComponentEditModeProps } from "../types"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

interface EditTableProps extends Partial<TableInterfaceComponentEditModeProps> {
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
}

/**
 * Edit Table
 * User may define the columns with data types, etc.
 */
export function EditTable({
  onChangeData,
  onChangeSchema,
  rowDetails,
  userInterfaceData,
  getRootUserInterfaceData,
  userInterfaceSchema,
  valueKey,
}: EditTableProps): JSX.Element {
  const dataArray = get(valueKey!, userInterfaceData) || []
  const data = { columns: dataArray }

  return (
    <>
      <ComponentRenderer
        components={editComponents}
        data={userInterfaceSchema}
        getRootData={getRootUserInterfaceData}
        mode="display"
        onChangeData={(newData) => {
          // console.log("TableInterfaceComponent.render", "onChangeData", {
          //   abstract,
          //   "edit",
          //   data,
          //   newData,
          //   onChangeSchema,
          //   userInterfaceSchema,
          // })
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
            onChangeData={(newData) => onChangeData && onChangeData(set(valueKey!, newData, userInterfaceData))}
            onChangeSchema={(newSchema) => {
              // console.log("TableInterfaceComponent.render", "onChangeSchema X2", {
              //   abstract,
              //   "edit",
              //   data,
              //   newSchema,
              //   onChangeSchema,
              //   userInterfaceSchema,
              // })
              onChangeSchema && userInterfaceSchema && onChangeSchema(set("rowDetails", newSchema, userInterfaceSchema))
            }}
          />
        </DataPathContext>
      </div>
    </>
  )
}
