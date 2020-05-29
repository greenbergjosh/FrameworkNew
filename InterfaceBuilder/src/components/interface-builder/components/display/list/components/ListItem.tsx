import { ListItemProps } from "components/interface-builder/components/display/list/types"
import { get, set } from "lodash/fp"
import { Draggable } from "components/interface-builder/dnd"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import React from "react"

export function ListItem({
  data,
  interleave,
  onChangeData,
  unwrapped,
  userInterfaceData,
  valueKey,
  component,
  index,
  listId,
}: ListItemProps) {
  const unwrappedData = React.useMemo(() => {
    return data[index]
      ? unwrapped
        ? {
            // @ts-ignore
            [component.valueKey]: data[index],
          }
        : data[index]
      : {}
  }, [data, unwrapped, component["valueKey"]])

  /* *************************************
   *
   * EVENT HANDLERS
   */

  function handleChangeData(index: number) {
    return (newData: object) => {
      const data = get(valueKey, userInterfaceData) || []
      console.log("ListInterfaceComponent.handleChangeData", { data, newData })

      return (
        onChangeData &&
        onChangeData(
          set(
            `${valueKey}.${index}`,
            unwrapped ? Object.values(newData)[0] : newData,
            userInterfaceData
          )
        )
      )
    }
  }

  function handleDeleteClick({ index }: { index: number }) {
    const existingData = get(valueKey, userInterfaceData) || []

    onChangeData &&
      onChangeData(
        set(
          valueKey,
          [...existingData.slice(0, index), ...existingData.slice(index + 1)],
          userInterfaceData
        )
      )
  }

  const handleSchemaChange = (newSchema: any) => {
    console.warn(
      "ListInterfaceComponent.render",
      "TODO: Cannot alter schema inside ComponentRenderer in List.",
      { newSchema }
    )
  }

  /* *************************************
   *
   * RENDER
   */

  return (
    <Draggable
      canCopy={false}
      canEdit={false}
      canPaste={false}
      data={data[index]}
      draggableId={`LIST_${listId}_ITEM_${index}`}
      editable={true}
      onDelete={handleDeleteClick}
      index={index}
      title=""
      type={`LIST_${listId}_ITEM`}>
      {() => (
        <ComponentRenderer
          key={index}
          components={[component]}
          componentLimit={interleave === "none" ? 1 : 0}
          data={unwrappedData}
          onChangeData={handleChangeData(index)}
          onChangeSchema={handleSchemaChange}
        />
      )}
    </Draggable>
  )
}
