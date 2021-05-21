import React from "react"
import { ComponentRenderer } from "../../../../components/ComponentRenderer/ComponentRenderer"
import { ComponentDefinition, UserInterfaceProps } from "../../../../globalTypes"

export function RowDetail(props: {
  components: ComponentDefinition[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  mode?: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  parentRowData: any
}): JSX.Element {
  const { onChangeData } = props
  const [data, setData] = React.useState({ ...props.parentRowData })

  const handleChangeData: UserInterfaceProps["onChangeData"] = React.useCallback((newData) => setData(newData), [
    onChangeData,
  ])

  return (
    <ComponentRenderer
      components={props.components}
      data={data}
      getRootData={props.getRootUserInterfaceData}
      setRootData={props.setRootUserInterfaceData}
      mode={props.mode}
      onChangeData={handleChangeData}
      onChangeSchema={() => void 0}
    />
  )
}
