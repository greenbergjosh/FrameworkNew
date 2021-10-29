import { Tooltip } from "antd"
import React from "react"
import { ComponentDefinition, UserInterface, UserInterfaceProps } from "@opg/interface-builder"
import { UserInterfaceWrapperProps } from "types"

export function UserInterfaceWrapper(props: UserInterfaceWrapperProps): JSX.Element {
  const { getValue, valueKey, defaultValue } = props
  const [data, setData] = React.useState({ data: props.defaultDataValue })
  const getComponents = () => getValue(valueKey) || defaultValue
  const components = getComponents()

  const handleChangeData = (data: UserInterfaceProps["data"]): void => {
    setData({ data })
  }

  const handleChangeSchema = (schema: ComponentDefinition[]) => {
    props.setValue([props.valueKey, schema])
  }

  if (props.mode === "edit") {
    return (
      <Tooltip title="User Interface may not be used in edit mode." trigger="click">
        <div>
          <div style={{ pointerEvents: "none" }}>
            <UserInterface
              components={components}
              data={data}
              getComponents={getComponents}
              getRootUserInterfaceData={props.getRootUserInterfaceData}
              hideMenu={props.hideMenu}
              mode="edit"
              onChangeData={handleChangeData}
              onChangeRootData={props.onChangeRootData}
              onChangeSchema={handleChangeSchema}
              submit={props.submit}
              title={props.label}
            />
          </div>
        </div>
      </Tooltip>
    )
  }
  return (
    <UserInterface
      components={components}
      data={data}
      getComponents={getComponents}
      getRootUserInterfaceData={props.getRootUserInterfaceData}
      hideMenu={props.hideMenu}
      mode="edit"
      onChangeData={handleChangeData}
      onChangeRootData={props.onChangeRootData}
      onChangeSchema={handleChangeSchema}
      submit={props.submit}
      title={props.label}
    />
  )
}
