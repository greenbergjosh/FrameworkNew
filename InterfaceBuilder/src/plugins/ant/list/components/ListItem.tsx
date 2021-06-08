import { ListItemProps } from "../types"
import { ComponentRenderer } from "../../../../components/ComponentRenderer/ComponentRenderer"
import React from "react"
import { JSONRecord } from "../../../../globalTypes/JSONTypes"

export function ListItem({
  data,
  index,
  interleave,
  component,
  unwrapped,
  userInterfaceData,
  getRootUserInterfaceData,
  onChangeRootData,
  setValue,
  valueKey,
}: ListItemProps): JSX.Element {
  const handleChangeData = (index: number) => (newData: JSONRecord) => {
    const path = `${valueKey}.${index}` // <-- valid lodash set() path for an array
    const value = unwrapped ? Object.values(newData)[0] : newData
    setValue([path, value, userInterfaceData])
  }

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
      getRootUserInterfaceData={getRootUserInterfaceData}
      onChangeRootData={onChangeRootData}
      onChangeData={handleChangeData(index)}
      onChangeSchema={(newSchema) => {
        console.warn("ListInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in List.", {
          newSchema,
        })
      }}
    />
  )
}
