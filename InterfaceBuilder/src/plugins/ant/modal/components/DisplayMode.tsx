import { Modal } from "antd"
import React from "react"
import { UserInterfaceProps } from "globalTypes"
import { isBoolean } from "lodash/fp"
import { ComponentRenderer } from "components/ComponentRenderer"
import { DataPathContext } from "contexts/DataPathContext"
import { DisplayModeProps } from "plugins/ant/modal/types"
import { tryCatch } from "fp-ts/lib/Option"

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  const { getValue, setValue, valueKey, showKey } = props

  /* ****************************
   *
   * PROP WATCHERS
   */

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

  const maskStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    return getCSSPropertiesFromJSON(props.maskStyle)
  }, [props.maskStyle])

  const bodyStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    return getCSSPropertiesFromJSON(props.bodyStyle)
  }, [props.bodyStyle])

  const modalStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    return getCSSPropertiesFromJSON(props.modalStyle)
  }, [props.modalStyle])

  /* ****************************
   *
   * EVENT HANDLERS
   */

  const handleCancel = () => {
    setValue([showKey, false])
  }

  const handleChangeData: UserInterfaceProps["onChangeData"] = React.useCallback(
    (newData: UserInterfaceProps["data"]) => {
      setValue([valueKey, newData])
    },
    [setValue, valueKey]
  )

  /* ****************************
   *
   * RENDER
   */

  return (
    <Modal
      closable={props.closable}
      destroyOnClose={props.destroyOnClose}
      mask={props.mask}
      maskStyle={maskStyle}
      bodyStyle={bodyStyle}
      style={modalStyle}
      onCancel={handleCancel}
      title={props.title || "Edit Item"}
      visible={visible}
      width={props.width}
      footer={
        /*
         * FOOTER
         */
        <DataPathContext path="footer.components">
          <ComponentRenderer
            key={"modal-footer"}
            components={(props.footer && props.footer.components) || []}
            data={data}
            getRootUserInterfaceData={props.getRootUserInterfaceData}
            onChangeRootData={props.onChangeRootData}
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
          components={props.components || []}
          data={data}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          onChangeRootData={props.onChangeRootData}
          onChangeData={handleChangeData}
          onChangeSchema={() => void 0}
        />
      </DataPathContext>
    </Modal>
  )
}

function getCSSPropertiesFromJSON(jsonStyle?: string): React.CSSProperties | undefined {
  const cssProperties = tryCatch(() => jsonStyle && (JSON.parse(jsonStyle) as React.CSSProperties)).toUndefined()
  if (cssProperties !== "") {
    return cssProperties
  }
  return undefined
}
