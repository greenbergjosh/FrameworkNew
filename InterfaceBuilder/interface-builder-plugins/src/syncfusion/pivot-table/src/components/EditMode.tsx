import React from "react"
import { ComponentRenderer } from "@opg/interface-builder"
import { EditModeProps } from "types"
import { set } from "lodash/fp"
import { editColumnComponents } from "../configs/editColumnComponents"

/*
  "columns": [{ "name": "Year", "caption": "Production Year" }, { "name": "Quarter" }],

  "expandAll": false,
  "filters": [],

  "formatSettings": [{ "name": "Amount", "format": "C0" }],

  "rows": [{ "name": "Country" }, { "name": "Products" }],

  "values": [
    { "name": "Sold", "caption": "Units Sold" },
    { "name": "Amount", "caption": "Sold Amount" }
  ],
 */

export function EditMode(props: EditModeProps): JSX.Element {
  return (
    <ComponentRenderer
      components={editColumnComponents}
      data={props.userInterfaceSchema}
      getRootUserInterfaceData={props.getRootUserInterfaceData}
      onChangeRootData={props.onChangeRootData}
      mode="display"
      onChangeData={(newData) => {
        props.onChangeSchema &&
          props.userInterfaceSchema &&
          props.onChangeSchema(set("columns", newData.columns, props.userInterfaceSchema))
      }}
      onChangeSchema={() => void 0}
    />
  )
}
