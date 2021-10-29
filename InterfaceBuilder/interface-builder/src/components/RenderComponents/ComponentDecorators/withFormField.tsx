import React from "react"
import { isEmpty } from "lodash/fp"
import { Form, Icon, Tooltip } from "antd"
import { ComponentModifierProps } from "../index"
import { ComposableFn } from "lib/compose"

export const withFormField: ComposableFn<React.ComponentType<ComponentModifierProps>> = (Wrapper) => {
  return (hocProps: ComponentModifierProps) => {
    /*
     * No label
     */
    if (hocProps.componentDefinition.hideLabel || isEmpty(hocProps.componentDefinition.label)) {
      return <Wrapper {...hocProps} />
    }

    const helpIcon = isEmpty(hocProps.componentDefinition.help) ? null : (
      <Tooltip title={hocProps.componentDefinition.help}>
        <Icon type="question-circle-o" />
      </Tooltip>
    )

    /*
     * Form control, so wrap it in Antd Form.Item
     */
    const isFormControl = hocProps.Component?.getLayoutDefinition().formControl || false

    if (isFormControl) {
      return (
        <Form.Item
          colon={false}
          label={
            <>
              {hocProps.componentDefinition.label} {helpIcon}
            </>
          }>
          <Wrapper {...hocProps} />
        </Form.Item>
      )
    }

    /*
     * Non-form control, so just add the label
     */
    return (
      <div className="label-wrapper">
        <label>
          {hocProps.componentDefinition.label} {helpIcon}
        </label>
        {/* NOTE: Spread adds Component={Component} */}
        <Wrapper {...hocProps} />
      </div>
    )
  }
}
