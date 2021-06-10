import React from "react"
import { ComponentModifierProps } from "components/ComponentRenderer"
import { Form, Icon, Tooltip } from "antd"
import { isEmpty } from "lodash/fp"
import { LayoutDefinition } from "../../globalTypes"

export const FormField: React.FC<
  ComponentModifierProps & {
    layoutDefinition: LayoutDefinition
  }
> = (props): JSX.Element => {
  /*
   * No label
   */
  if (props.componentDefinition.hideLabel || isEmpty(props.componentDefinition.label)) {
    return <>{props.children}</>
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
        {props.children}
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
      {props.children}
    </div>
  )
}
