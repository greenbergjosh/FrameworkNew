import { Form, Input } from "antd"
import { get, set, throttle } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { inputManageForm } from "./input-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface InputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "input"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

interface InputInterfaceComponentState {}

export class InputInterfaceComponent extends BaseInterfaceComponent<InputInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "input",
      title: "Text Input",
      icon: "edit",
      formControl: true,
      componentDefinition: {
        component: "input",
        label: "Text",
      },
    }
  }

  static manageForm = inputManageForm

  constructor(props: InputInterfaceComponentProps) {
    super(props)
  }

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    onChangeData && onChangeData(set(valueKey, value, userInterfaceData))
  }
  render(): JSX.Element {
    const { defaultValue, userInterfaceData, valueKey } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    return <Input onChange={this.handleChange} value={value} />
  }
}
