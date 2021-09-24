import { Checkbox } from "antd"
import { CheckboxChangeEvent } from "antd/lib/checkbox"
import React from "react"
import { checkboxManageForm } from "./checkbox-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  Undraggable,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { isBoolean } from "lodash/fp"
import layoutDefinition from "./layoutDefinition"

export interface CheckboxInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "checkbox"
  defaultValue?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  disabled: boolean
}

interface CheckboxInterfaceComponentState {
  value: boolean
}

export default class CheckboxInterfaceComponent extends BaseInterfaceComponent<
  CheckboxInterfaceComponentProps,
  CheckboxInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: true,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = checkboxManageForm

  constructor(props: CheckboxInterfaceComponentProps) {
    super(props)

    const rawValue = this.getValue(this.props.valueKey)
    if (isBoolean(rawValue)) {
      const value = rawValue
      this.state = { value }
    } else {
      this.state = { value: false }
    }
  }

  handleChange = ({ target: { checked } }: CheckboxChangeEvent) => {
    this.setValue([this.props.valueKey, checked])
  }

  render(): JSX.Element {
    const { defaultValue, valueKey, disabled } = this.props
    const rawValue = this.getValue(valueKey)
    const value = typeof rawValue === "boolean" ? rawValue : defaultValue

    return (
      <Undraggable wrap="shrink">
        <Checkbox onChange={this.handleChange} checked={value} disabled={disabled} />
      </Undraggable>
    )
  }
}
