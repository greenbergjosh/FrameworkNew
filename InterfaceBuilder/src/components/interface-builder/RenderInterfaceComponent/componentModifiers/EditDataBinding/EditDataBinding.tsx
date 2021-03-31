import React from "react"
import { Button, Tooltip } from "antd"
import { isEmpty, isPlainObject, set } from "lodash/fp"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { ComponentModifierProps, RenderInterfaceComponentProps } from "../../types"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"
import styles from "./styles.scss"
import { EditDataBindingModal } from "./EditDataBindingModal"
import { DataBinding } from "../../DataBinding/DataBinding"

/**
 *
 * @param props: {
 *   @property componentDefinition -- The component's current property control (bindable indicated here)
 *   @property onChangeData
 *   @property onChangeSchema
 *   @property userInterfaceData -- The component being configured (bindings saved here)
 * }
 * @constructor
 */
export const EditDataBinding: React.FC<
  ComponentModifierProps & {
    onChangeData: UserInterfaceProps["onChangeData"]
    onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"]
    userInterfaceData: UserInterfaceProps["data"]
    mode: UserInterfaceProps["mode"]
  }
> = (props): JSX.Element => {
  const { key } = props.componentDefinition
  const { bindings } = props.userInterfaceData
  const initialRawRules = bindings ? bindings[key] : {}

  const [isBinding, setIsBinding] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [rawRules, setRawRules] = React.useState<JSONRecord>(initialRawRules)

  /**
   * Forward modified componentDefinition
   */
  const childrenWithComposedProps = React.useMemo(
    () =>
      React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          /* Apply the bound props */
          return React.cloneElement(child, props.componentDefinition)
        }
        /* Not a valid element, so just return it */
        return child
      }),
    [props.children, props.componentDefinition]
  )

  /**
   * Set state from props and do basic jsonLogic validation.
   */
  const validJsonLogic = React.useMemo<JSONRecord>(() => {
    if (isPlainObject(rawRules) && !isEmpty(rawRules)) {
      setIsBinding(true)
      return rawRules as JSONRecord
    }
    return {}
  }, [rawRules])

  if (!props.componentDefinition.bindable) {
    return <>{childrenWithComposedProps}</>
  }

  const handleCancelEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.FocusEvent<HTMLDivElement>) => {
    if (isBinding) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleOpenModal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isBinding && props.mode !== "preview") {
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
    props.onChangeData && props.onChangeData(set(`bindings.${key}`, undefined, props.userInterfaceData))
  }

  const handleSave = (newJsonLogic: JSONRecord) => {
    setRawRules(newJsonLogic)
    setIsBinding(true)
    setShowModal(false)
    props.onChangeData && props.onChangeData(set(`bindings.${key}`, newJsonLogic, props.userInterfaceData))
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
          <DataBinding
            componentDefinition={props.componentDefinition}
            onChangeData={props.onChangeData}
            onChangeSchema={props.onChangeSchema}
            userInterfaceData={props.userInterfaceData}>
            {childrenWithComposedProps}
          </DataBinding>
          {isBinding && (
            <div className={styles.controlMask}>
              <div className={styles.controlMaskLabel}>Bound Value</div>
            </div>
          )}
        </div>
        <Tooltip title={`Bind "${props.componentDefinition.label}" to data`}>
          <Button
            type="default"
            icon="setting"
            shape="circle"
            size="small"
            className={styles.bindingIcon}
            style={{ color: isBinding ? "#0071E6" : "lightgrey" }}
            onClick={() => props.mode !== "preview" && setShowModal(true)}
          />
        </Tooltip>
      </div>
      <EditDataBindingModal
        propertyLabel={props.componentDefinition.label}
        propertyName={props.componentDefinition.key}
        visible={showModal}
        isBinding={isBinding}
        rules={validJsonLogic}
        onCancel={handleCancel}
        onDelete={handleDelete}
        onSave={handleSave}
      />
    </>
  )
}
