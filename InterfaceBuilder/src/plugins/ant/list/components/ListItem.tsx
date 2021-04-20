import { ListItemProps } from "../types"
import { get, set } from "lodash/fp"
import { ComponentRenderer } from "../../../../components/ComponentRenderer/ComponentRenderer"
import React from "react"

export function ListItem({
  data,
  index,
  interleave,
  component,
  onChangeData,
  unwrapped,
  userInterfaceData,
  getRootUserInterfaceData,
  valueKey,
}: ListItemProps) {
  /* Event Handlers */

  const handleChangeData = (index: number) => (newData: object) => {
    const data = get(valueKey, userInterfaceData) || []

    console.log("ListInterfaceComponent.onChangeData", {
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
      getRootData={getRootUserInterfaceData}
      onChangeData={handleChangeData(index)}
      onChangeSchema={(newSchema) => {
        console.warn("ListInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in List.", {
          newSchema,
        })
      }}
    />
  )
}
