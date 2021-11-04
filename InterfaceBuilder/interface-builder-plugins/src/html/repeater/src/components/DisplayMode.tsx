import React from "react"
import { DisplayModeProps } from "../types"
import { JSONRecord, ComponentRenderer } from "@opg/interface-builder"
import { v4 as uuid } from "uuid"
import { UserInterfaceProps } from "../../../../../../interface-builder/src"

export function DisplayMode({
  components,
  data,
  getRootUserInterfaceData,
  onChangeRootData,
  onChange,
}: DisplayModeProps): JSX.Element | null {
  const repeaterId = React.useMemo(uuid, [])

  React.useEffect(() => {
    const initRecords: JSONRecord[] = []

    // Update userInterfaceData
    if (initRecords.length > 0) {
      const nextState = [...data, ...initRecords]
      onChange(nextState)
    }
  }, [])

  /**
   *
   * @param index
   * @param nextItemDataState
   */
  const handleChange = React.useCallback(
    (index: number, nextItemState: UserInterfaceProps["data"]) => {
      onChange(nextItemState, `[${index}]`)
    },
    [onChange]
  )

  if (data.length) {
    return (
      <>
        {data.map((itemData, index) => (
          <ComponentRenderer
            key={`repeater-${repeaterId}_item-${index}`}
            components={components}
            data={{
              ...itemData,
              index,
            }}
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
            onChangeData={(nextData: JSONRecord): void => {
              !isNaN(index) && handleChange(index, nextData)
            }}
            onChangeSchema={() => void 0}
          />
        ))}
      </>
    )
  }

  return null
}
