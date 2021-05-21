import { Modal } from "antd"
import React from "react"
import { ComponentDefinition, ComponentRenderMetaProps, IBaseInterfaceComponent, UserInterfaceProps } from "globalTypes"
import { isBoolean } from "lodash/fp"
import { ComponentRenderer } from "components/ComponentRenderer"
import { DataPathContext } from "contexts/DataPathContext"

export function DisplayMode(props: {
  components: ComponentDefinition[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"] //EditUserInterfaceProps["onChangeSchema"]
  userInterfaceData: UserInterfaceProps["data"]
  userInterfaceSchema?: ComponentDefinition
  setValue: IBaseInterfaceComponent["setValue"]
  getValue: IBaseInterfaceComponent["getValue"]
  showKey: string
  title: string
  valueKey: string
  footer: {
    components: ComponentDefinition[]
  }
}): JSX.Element {
  const { getValue, valueKey, showKey } = props

  const visible = React.useMemo(() => {
    const visible = getValue(showKey)
    if (isBoolean(visible)) {
      return visible
    }
    return false
  }, [getValue, showKey])

  const data = React.useMemo(() => {
    return getValue(valueKey)
  }, [getValue, valueKey])

  const handleCancel = () => {
    props.setValue(props.showKey, false, props.userInterfaceData)
  }

  const handleChangeData: UserInterfaceProps["onChangeData"] = React.useCallback(
    (newData: UserInterfaceProps["data"]) => {
      const isTargetingRoot = false
      if (isTargetingRoot) {
        // Put newData in the root context
        props.setRootUserInterfaceData(newData)
      } else {
        // Put newData in the modal's context
        props.setValue(props.valueKey, newData, props.userInterfaceData)
      }
    },
    [props]
  )

  return (
    <Modal
      title={props.title || "Edit Item"}
      visible={visible}
      onCancel={handleCancel}
      footer={
        /*
         * FOOTER
         */
        <DataPathContext path="footer.components">
          <ComponentRenderer
            key={"modal-footer"}
            components={props.footer.components}
            data={data}
            getRootData={props.getRootUserInterfaceData}
            setRootData={props.setRootUserInterfaceData}
            onChangeData={handleChangeData}
            onChangeSchema={() => void 0}
          />
        </DataPathContext>
      }>
      {/*
       * CONTENT
       */}
      <DataPathContext path="components">
        <ComponentRenderer
          key={"modal-content"}
          components={props.components}
          data={data}
          getRootData={props.getRootUserInterfaceData}
          setRootData={props.setRootUserInterfaceData}
          onChangeData={handleChangeData}
          onChangeSchema={() => void 0}
        />
      </DataPathContext>
    </Modal>
  )
}
