import { Switch } from "antd"
import { SwitchProps } from "antd/lib/switch"
import React from "react"
import { toggleManageForm } from "./toggle-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { Undraggable } from "components/DragAndDrop/Undraggable"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"
import { isBoolean } from "lodash/fp"

export interface ToggleInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "toggle"
  defaultValue?: boolean
  inverted?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  size: SwitchProps["size"]
}

export class ToggleInterfaceComponent extends BaseInterfaceComponent<ToggleInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
  }

  static getLayoutDefinition(): LayoutDefinition {
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
    const { inverted, valueKey } = this.props
    this.setValue(valueKey, inverted ? !checked : checked)
  }

  isChecked = (): boolean => {
    const { defaultValue, inverted, userInterfaceData, valueKey } = this.props
    const rawValue = this.getValue(valueKey, userInterfaceData)
    if (isBoolean(rawValue)) {
      return inverted ? !rawValue : rawValue
    }
    if (isBoolean(defaultValue)) {
      return defaultValue
    }
    return false
  }

  render(): JSX.Element {
    return (
      <Undraggable wrap="shrink">
        <Switch onChange={this.handleChange} checked={this.isChecked()} size={this.props.size} />
      </Undraggable>
    )
  }
}
