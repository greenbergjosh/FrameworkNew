import { Checkbox } from "antd"
import { CheckboxChangeEvent } from "antd/lib/checkbox"
import React from "react"
import { checkboxManageForm } from "./checkbox-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface CheckboxInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "checkbox"
  defaultValue?: boolean
  placeholder: string
  valueKey: string
  value: boolean
}

interface CheckboxInterfaceComponentState {
  value: boolean
}

export class CheckboxInterfaceComponent extends BaseInterfaceComponent<
  CheckboxInterfaceComponentProps,
  CheckboxInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: true,
  }

  static getLayoutDefinition() {
    return {
      name: "checkbox",
      title: "Checkbox",
      icon: "check-square",
      formControl: true,
      componentDefinition: {
        component: "checkbox",
        label: "Checkbox",
      },
    }
  }

  static manageForm = checkboxManageForm

  constructor(props: CheckboxInterfaceComponentProps) {
    super(props)

    const { defaultValue, value } = props

    this.state = { value: value || defaultValue || false }
  }

  handleChange = ({ target: { checked } }: CheckboxChangeEvent) => {
    this.setState({ value: checked })
  }

  render(): JSX.Element {
    const value = this.state.value
    return <Checkbox onChange={this.handleChange} checked={value} />
  }
}
