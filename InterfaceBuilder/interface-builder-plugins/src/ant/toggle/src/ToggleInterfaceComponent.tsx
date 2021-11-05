import React from "react"
import { Switch } from "antd"
import { SwitchProps } from "antd/lib/switch"
import { settings } from "./settings"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  Undraggable,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { isBoolean } from "lodash/fp"
import layoutDefinition from "./layoutDefinition"

export interface ToggleInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "toggle"
  defaultValue?: boolean
  inverted?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  size: SwitchProps["size"]
}

export default class ToggleInterfaceComponent extends BaseInterfaceComponent<ToggleInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  handleChange = (checked: boolean) => {
    const { inverted, valueKey } = this.props
    this.setValue([valueKey, inverted ? !checked : checked])
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
