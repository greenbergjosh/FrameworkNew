import React from "react"
import { ComponentRenderer } from "@opg/interface-builder"
import { EditModeProps } from "types"
import { set } from "lodash/fp"
import { editColumnComponents } from "../configs/editColumnComponents"

export function EditMode(props: EditModeProps): JSX.Element {
  return (
    <div style={{ backgroundColor: "rgb(236, 236, 236)", padding: 10, margin: -5, border: "solid 1px lightgrey" }}>
      <div
        style={{
          marginBottom: 5,
        }}>
        <ComponentRenderer
          components={editColumnComponents}
          data={props.userInterfaceSchema}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          onChangeRootData={props.onChangeRootData}
          mode="display"
          onChangeData={(newData) => {
            if (props.onChangeSchema && props.userInterfaceSchema) {
              let newSchema = props.userInterfaceSchema

              //
              // Mapped props
              newSchema = set("columns", newData.columns, newSchema)
              newSchema = set("rows", newData.rows, newSchema)
              newSchema = set("values", newData.values, newSchema)
              newSchema = set("filters", newData.filters, newSchema)
              //
              // Mapped Settings props
              newSchema = set("formatSettings", newData.formatSettings, newSchema)
              newSchema = set("calculatedFieldSettings", newData.calculatedFieldSettings, newSchema)
              newSchema = set("filterSettings", newData.filterSettings, newSchema)

              props.onChangeSchema(newSchema)
            }
          }}
          onChangeSchema={() => void 0}
        />
      </div>
    </div>
  )
}
