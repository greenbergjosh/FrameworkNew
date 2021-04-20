import { Input } from "antd"
import { get, set } from "lodash/fp"
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
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  valueKey: string
  hasShowPasswordToggle?: boolean
}

interface PasswordInterfaceComponentState {}

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
    const { onChangeData, userInterfaceData, valueKey } = this.props
    onChangeData && onChangeData(set(valueKey, value, userInterfaceData))
  }
  render(): JSX.Element {
    const { defaultValue, userInterfaceData, valueKey, hasShowPasswordToggle } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    return <Input.Password onChange={this.handleChange} value={value} visibilityToggle={hasShowPasswordToggle} />
  }
}
