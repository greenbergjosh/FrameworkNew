import { Switch } from "antd"
import React from "react"
import { toggleManageForm } from "./toggle-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

export interface ToggleInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "toggle"
  defaultValue?: boolean
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

  constructor(props: ToggleInterfaceComponentProps) {
    super(props)

    const { defaultValue, value } = props

    this.state = { value: value || defaultValue || false }
  }

  handleChange = (checked: boolean) => {
    this.setState({ value: checked })
  }

  render(): JSX.Element {
    const value = this.state.value
    return <Switch onChange={this.handleChange} checked={value} />
  }
}
