import React from "react"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { ComponentDefinition } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export function RowDetail(props: {
  components: ComponentDefinition[]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  mode?: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  parentRowData: any
}): JSX.Element {
  const { onChangeData, parentRowData } = props
  const [data, setData] = React.useState({ ...props.parentRowData })

  const handleChangeData: UserInterfaceProps["onChangeData"] = React.useCallback(
    (newData, isTargetingRoot) => {
      if (isTargetingRoot) {
        // Put newData in the parent's context
        onChangeData && onChangeData(newData)
      } else {
        // Put newData in the current row's context
        setData({ ...parentRowData, ...newData })
      }
    },
    [onChangeData, parentRowData]
  )

  return (
    <ComponentRenderer
      components={props.components}
      data={data}
      getRootData={props.getRootUserInterfaceData}
      mode={props.mode}
      onChangeData={handleChangeData}
      onChangeSchema={(newSchema: any) => void 0}
    />
  )
}
