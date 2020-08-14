import { ListItemProps } from "../types"
import { get, set } from "lodash/fp"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import React from "react"

export function ListItem({
  data,
  index,
  interleave,
  component,
  onChangeData,
  unwrapped,
  userInterfaceData,
  valueKey,
}: ListItemProps) {
  /* Event Handlers */

  const handleChangeData = (index: number) => (newData: object) => {
    const data = get(valueKey, userInterfaceData) || []

    console.log("ListInterfaceComponent.handleChangeData", {
      data,
      newData,
    })

    return (
      onChangeData &&
      onChangeData(set(`${valueKey}.${index}`, unwrapped ? Object.values(newData)[0] : newData, userInterfaceData))
    )
  }

  /* Render */

  return (
    <ComponentRenderer
      components={[component]}
      componentLimit={interleave === "none" ? 1 : 0}
      data={
        data[index]
          ? unwrapped
            ? {
                // @ts-ignore
                [component.valueKey]: data[index],
              }
            : data[index]
          : {}
      }
      onChangeData={handleChangeData(index)}
      onChangeSchema={(newSchema) => {
        console.warn("ListInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in List.", {
          newSchema,
        })
      }}
    />
  )
}