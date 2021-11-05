import React from "react"
import { InputNumber } from "antd"
import { InputNumberProps } from "antd/lib/input-number"
import { isEmpty, isNumber, isUndefined, parseInt } from "lodash/fp"
import { settings } from "./settings"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  JSONRecord,
  LayoutDefinition,
  Undraggable,
  UserInterfaceProps,
} from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"

export interface NumberInputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "number-input"
  defaultValue?: string | number
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  size: InputNumberProps["size"]
  max: InputNumberProps["max"]
  min: InputNumberProps["min"]
}

export default class NumberInputInterfaceComponent extends BaseInterfaceComponent<NumberInputInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  constructor(props: NumberInputInterfaceComponentProps) {
    super(props)
  }

  handleChange = (value?: number) => {
    this.setValue([this.props.valueKey, value])
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
