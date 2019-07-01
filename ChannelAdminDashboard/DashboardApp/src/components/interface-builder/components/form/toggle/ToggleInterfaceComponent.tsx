import { Switch } from "antd"
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
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  value: boolean
}

interface ToggleInterfaceComponentState {
  value: boolean
}

export class ToggleInterfaceComponent extends BaseInterfaceComponent<
  ToggleInterfaceComponentProps,
  ToggleInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: true,
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
    const { onChangeData, userInterfaceData, valueKey } = this.props
    onChangeData && onChangeData({ ...userInterfaceData, [valueKey]: checked })
  }

  render(): JSX.Element {
    const { defaultValue, onChangeData, userInterfaceData, valueKey } = this.props
    const value =
      typeof userInterfaceData[valueKey] !== "undefined"
        ? userInterfaceData[valueKey]
        : defaultValue
    return <Switch onChange={this.handleChange} checked={value} />
  }
}
