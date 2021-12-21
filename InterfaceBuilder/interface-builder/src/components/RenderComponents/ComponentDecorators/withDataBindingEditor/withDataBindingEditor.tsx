import React from "react"
import styles from "./styles.scss"
import { Button, Tooltip } from "antd"
import { ComponentModifierProps } from "../../types"
import { EditDataBindingModal } from "./EditDataBindingModal"
import { isEmpty, isPlainObject, set } from "lodash/fp"
import { JSONRecord } from "globalTypes/JSONTypes"
import { ComposableFn } from "lib/compose"

export const withDataBindingEditor: ComposableFn<React.ComponentType<ComponentModifierProps>> = (Wrapper) => {
  const _withDataBindingEditor = (hocProps: ComponentModifierProps) => {
    const { key } = hocProps.componentDefinition
    const { bindings } = hocProps.userInterfaceData || {}
    const initialRawRules = bindings ? bindings[key] : {}
    const [isBinding, setIsBinding] = React.useState(false)
    const [showModal, setShowModal] = React.useState(false)
    const [rawRules, setRawRules] = React.useState<JSONRecord>(initialRawRules)

    /**
     * Set state from hocProps and do basic jsonLogic validation.
     */
    const validJsonLogic = React.useMemo<JSONRecord>(() => {
      if (isPlainObject(rawRules) && !isEmpty(rawRules)) {
        setIsBinding(true)
        return rawRules as JSONRecord
      }
      return {}
    }, [rawRules])

    if (!hocProps.componentDefinition.bindable) {
      return <Wrapper {...hocProps} />
    }

    const handleCancelEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.FocusEvent<HTMLDivElement>) => {
      if (isBinding) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleOpenModal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (isBinding && hocProps.mode !== "preview") {
        setShowModal(true)
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleCancel = () => {
      setShowModal(false)
    }

    const handleDelete = () => {
      setRawRules({})
      setIsBinding(false)
      setShowModal(false)
      hocProps.onChangeData && hocProps.onChangeData(set(`bindings.${key}`, undefined, hocProps.userInterfaceData))
    }

    const handleSave = (newJsonLogic: JSONRecord) => {
      setRawRules(newJsonLogic)
      setIsBinding(true)
      setShowModal(false)
      hocProps.onChangeData && hocProps.onChangeData(set(`bindings.${key}`, newJsonLogic, hocProps.userInterfaceData))
    }

    return (
      <>
        <div className={styles.controlWrapper}>
          <div
            className={styles.controlMaskContainer}
            onMouseDownCapture={handleCancelEvent}
            onFocusCapture={handleCancelEvent}
            onMouseOverCapture={handleCancelEvent}
            onClickCapture={handleOpenModal}>
            <Wrapper {...hocProps} />
            {isBinding && (
              <div className={styles.controlMask}>
                <div className={styles.controlMaskLabel}>Bound Value</div>
              </div>
            )}
          </div>
          <Tooltip title={`Bind "${hocProps.componentDefinition.label}" to data`}>
            <Button
              className={styles.bindingIcon}
              icon="setting"
              onClick={() => hocProps.mode !== "preview" && setShowModal(true)}
              shape="circle"
              size="small"
              style={{ color: isBinding ? "#0071E6" : "lightgrey", backgroundColor: "transparent" }}
              type="default"
            />
          </Tooltip>
        </div>
        <EditDataBindingModal
          CodeEditor={hocProps.CodeEditor}
          isBinding={isBinding}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onSave={handleSave}
          propertyLabel={hocProps.componentDefinition.label}
          propertyName={hocProps.componentDefinition.key}
          rules={validJsonLogic}
          visible={showModal}
        />
      </>
    )
  }
  return _withDataBindingEditor
}
