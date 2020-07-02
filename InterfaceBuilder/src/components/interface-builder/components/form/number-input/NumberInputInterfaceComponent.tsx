import { Form, Input, InputNumber } from "antd"
import { InputNumberProps } from "antd/lib/input-number"
import { get, set, throttle } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { numberInputManageForm } from "./number-input-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface NumberInputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "number-input"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  size: InputNumberProps["size"]
}

export class NumberInputInterfaceComponent extends BaseInterfaceComponent<
  NumberInputInterfaceComponentProps
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "number-input",
      title: "Number Input",
      icon: "number",
      formControl: true,
      componentDefinition: {
        component: "number-input",
        label: "Number",
      },
    }
  }

  static manageForm = numberInputManageForm

  constructor(props: NumberInputInterfaceComponentProps) {
    super(props)
  }

  handleChange = (value?: number) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    onChangeData && onChangeData(set(valueKey, value, userInterfaceData))
  }
  render(): JSX.Element {
    const { defaultValue, userInterfaceData, valueKey, size } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    return <InputNumber onChange={this.handleChange} value={value} size={size} />
  }
}
