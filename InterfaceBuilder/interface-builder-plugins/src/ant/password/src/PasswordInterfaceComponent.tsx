import React from "react"
import { Input } from "antd"
import { passwordManageForm } from "./password-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"

export interface PasswordInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "password"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  hasShowPasswordToggle?: boolean
}

export default class PasswordInterfaceComponent extends BaseInterfaceComponent<PasswordInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter password",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = passwordManageForm

  constructor(props: PasswordInterfaceComponentProps) {
    super(props)
  }

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    this.setValue([this.props.valueKey, value])
  }
  render(): JSX.Element {
    const { defaultValue, valueKey, hasShowPasswordToggle } = this.props
    const rawValue = this.getValue(valueKey)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    return <Input.Password onChange={this.handleChange} value={value} visibilityToggle={hasShowPasswordToggle} />
  }
}
