import React from "react"
import { isEmpty } from "lodash/fp"
import { Form, Icon, Tooltip } from "antd"
import { ComponentModifierProps } from "components/interface-builder/RenderInterfaceComponent"
import { LayoutDefinition } from "components/interface-builder/components/base/BaseInterfaceComponent"

export const FormField: React.FC<
  ComponentModifierProps & {
    layoutDefinition: LayoutDefinition
  }
> = (props): JSX.Element => {
  /**
   * Forward modified componentDefinition
   */
  const childrenWithComposedProps = React.useMemo(
    () =>
      React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          /* Apply the bound props */
          return React.cloneElement(child, { componentDefinition: props.componentDefinition })
        }
        /* Not a valid element, so just return it */
        return child
      }),
    [props.children, props.componentDefinition]
  )

  /*
   * No label
   */
  if (props.componentDefinition.hideLabel || isEmpty(props.componentDefinition.label)) {
    return <>{childrenWithComposedProps}</>
  }

  const helpIcon = isEmpty(props.componentDefinition.help) ? null : (
    <Tooltip title={props.componentDefinition.help}>
      <Icon type="question-circle-o" />
    </Tooltip>
  )

  /*
   * Form control, so wrap it in Antd Form.Item
   */
  const isFormControl = props.layoutDefinition.formControl || false

  if (isFormControl) {
    return (
      <Form.Item
        colon={false}
        label={
          <>
            {props.componentDefinition.label} {helpIcon}
          </>
        }>
        {childrenWithComposedProps}
      </Form.Item>
    )
  }

  /*
   * Non-form control, so just add the label
   */
  return (
    <div className="label-wrapper">
      <label>
        {props.componentDefinition.label} {helpIcon}
      </label>
      {childrenWithComposedProps}
    </div>
  )
}
