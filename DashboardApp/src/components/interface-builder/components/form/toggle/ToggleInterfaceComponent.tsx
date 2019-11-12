import { Switch } from "antd"
import { get, set } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { toggleManageForm } from "./toggle-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

export interface ToggleInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "toggle"
  defaultValue?: boolean
  inverted?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export class ToggleInterfaceComponent extends BaseInterfaceComponent<
  ToggleInterfaceComponentProps
> {
  static defaultProps = {
    valueKey: "value",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "toggle",
      title: "Toggle",
      icon: "login",
      formControl: true,
      componentDefinition: {
        component: "toggle",
        label: "Toggle",
      },
    }
  }

  static manageForm = toggleManageForm

  handleChange = (checked: boolean) => {
    const { inverted, onChangeData, userInterfaceData, valueKey } = this.props
    onChangeData && onChangeData(set(valueKey, inverted ? !checked : checked, userInterfaceData))
  }

  render(): JSX.Element {
    const { defaultValue, inverted, userInterfaceData, valueKey } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const realValue = (typeof rawValue !== "undefined" ? rawValue : defaultValue) || false
    const finalValue = inverted ? !realValue : realValue
    return <Switch onChange={this.handleChange} checked={finalValue} />
  }
}