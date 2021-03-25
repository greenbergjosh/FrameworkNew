import React from "react"
import { isEmpty } from "lodash/fp"
import { Form, Icon, Tooltip } from "antd"

export const FormFieldWrapper: React.FC<{
  hideLabel?: boolean
  label?: string
  help?: string
  isFormControl: boolean
}> = (props): JSX.Element => {
  /*
   * No label
   */
  if (props.hideLabel || isEmpty(props.label)) {
    return <>{props.children}</>
  }

  const helpContent = isEmpty(props.help) ? null : (
    <Tooltip title={props.help}>
      <Icon type="question-circle-o" />
    </Tooltip>
  )

  /*
   * Form control, so wrap it in Antd Form.Item
   */
  if (props.isFormControl) {
    return (
      <Form.Item
        colon={false}
        label={
          <>
            {props.label} {helpContent}
          </>
        }>
        {props.children}
      </Form.Item>
    )
  }

  /*
   * Non-form control
   */
  return (
    <div className="label-wrapper">
      <label>
        {props.label} {helpContent}
      </label>
      {props.children}
    </div>
  )
}
