import { Input } from "antd"
import React from "react"
import { passwordManageForm } from "./password-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

export interface PasswordInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "password"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  hasShowPasswordToggle?: boolean
}

export class PasswordInterfaceComponent extends BaseInterfaceComponent<PasswordInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter password",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Form",
      name: "password",
      title: "Password",
      icon: "lock",
      formControl: true,
      componentDefinition: {
        component: "password",
        label: "Password",
      },
    }
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
