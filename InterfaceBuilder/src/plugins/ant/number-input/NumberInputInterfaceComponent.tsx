import { InputNumber } from "antd"
import { InputNumberProps } from "antd/lib/input-number"
import { isEmpty, isNumber, isUndefined, parseInt } from "lodash/fp"
import React from "react"
import { numberInputManageForm } from "./number-input-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { Undraggable } from "components/DragAndDrop/Undraggable"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"
import { JSONRecord } from "../../../globalTypes/JSONTypes"

export interface NumberInputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "number-input"
  defaultValue?: string | number
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  valueKey: string
  size: InputNumberProps["size"]
  max: InputNumberProps["max"]
  min: InputNumberProps["min"]
}

export class NumberInputInterfaceComponent extends BaseInterfaceComponent<NumberInputInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Form",
      name: "number-input",
      title: "Number Input",
      icon: "number",
      formControl: true,
      componentDefinition: {
        component: "number-input",
        label: "Number",
      },
    }
  }

  static manageForm = numberInputManageForm

  constructor(props: NumberInputInterfaceComponentProps) {
    super(props)
  }

  handleChange = (value?: number) => {
    this.setValue(this.props.valueKey, value)
  }

  private getNumberValue(valueKey: string, defaultValue: string | number | undefined): number | undefined {
    const rawValue = this.getValue(valueKey)
    return !isUndefined(rawValue) ? getNumberFromValue(rawValue) : getNumberFromValue(defaultValue)
  }

  render(): JSX.Element {
    const { defaultValue, valueKey, size, max, min } = this.props
    const value = this.getNumberValue(valueKey, defaultValue)
    const minAttr = !isUndefined(min) ? { min } : undefined
    const maxAttr = !isUndefined(max) ? { max } : undefined

    return (
      <Undraggable wrap="shrink">
        <InputNumber onChange={this.handleChange} value={value} size={size} {...minAttr} {...maxAttr} />
      </Undraggable>
    )
  }
}

/**
 * Get a number from a number or stringified number
 * @param defaultValue
 */
function getNumberFromValue(
  defaultValue: string | number | boolean | JSONRecord | JSONRecord[] | null | undefined
): number | undefined {
  if (isNumber(defaultValue)) {
    return !isNaN(defaultValue) ? defaultValue : undefined
  }
  if (isEmpty(defaultValue)) {
    return undefined
  }
  return parseInt(10)(defaultValue as string)
}
