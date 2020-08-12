import { Checkbox } from "antd"
import { CheckboxChangeEvent } from "antd/lib/checkbox"
import { get, set } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { checkboxManageForm } from "./checkbox-manage-form"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent"
import { Undraggable } from "../../_shared/Undraggable"

export interface CheckboxInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "checkbox"
  defaultValue?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
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
      category: "Form",
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

    const { defaultValue, userInterfaceData, valueKey } = props

    this.state = { value: get(valueKey, userInterfaceData) || defaultValue || false }
  }

  handleChange = ({ target: { checked } }: CheckboxChangeEvent) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    onChangeData && onChangeData(set(valueKey, checked, userInterfaceData))
  }

  render(): JSX.Element {
    const { defaultValue, userInterfaceData, valueKey } = this.props
    const rawValue = get(valueKey, userInterfaceData)

    const value = typeof rawValue === "boolean" ? rawValue : defaultValue
    return (
      <Undraggable wrap="shrink">
        <Checkbox onChange={this.handleChange} checked={value} />
      </Undraggable>
    )
  }
}
