import React from "react"
import { settings } from "./settings"
import { set } from "lodash/fp"
import { Slider } from "antd"
import { SliderMarks, SliderValue } from "antd/lib/slider"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"

interface LabelValue {
  label?: string
  value?: number
}

type NumberRange = {
  [key: string]: number
}

export interface NumberRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "number-range"
  defaultRangeValueType: "none" | "full" | "partial"
  defaultRangeLowerValue?: number
  defaultRangeUpperValue?: number

  lowerBound?: number
  upperBound?: number
  marks?: LabelValue[]

  orientation?: "horizontal" | "vertical"

  onChangeData: UserInterfaceProps["onChangeData"]
  startKey: string
  endKey: string
  userInterfaceData: UserInterfaceProps["data"]
}

interface NumberRangeInterfaceComponentState {}

export default class NumberRangeInterfaceComponent extends BaseInterfaceComponent<
  NumberRangeInterfaceComponentProps,
  NumberRangeInterfaceComponentState
> {
  static defaultProps = {
    startKey: "start",
    endKey: "end",
    orientation: "horizontal",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  static getDefinitionDefaultValue({
    defaultRangeValueType,
    defaultRangeLowerValue,
    defaultRangeUpperValue,
    lowerBound,
    upperBound,
    endKey,
    startKey,
  }: NumberRangeInterfaceComponentProps): NumberRange {
    if (defaultRangeValueType !== "none") {
      let lowerValue, upperValue
      if (defaultRangeValueType === "full") {
        lowerValue = lowerBound
        upperValue = upperBound
      } else if (defaultRangeValueType === "partial") {
        lowerValue = defaultRangeLowerValue
        upperBound = defaultRangeUpperValue
      }
      return set(startKey, lowerValue, set(endKey, upperValue, {}))
    }
    return {}
  }

  handleChange = (value: SliderValue) => {
    if (Array.isArray(value)) {
      this.setValue([
        [this.props.startKey, value[0]],
        [this.props.endKey, value[1]],
      ])
    }
  }

  getDefaultValue = () => {
    return NumberRangeInterfaceComponent.getDefinitionDefaultValue(this.props)
  }

  getValues = (): [number, number] => {
    return [this.getValue(this.props.startKey), this.getValue(this.props.endKey)]
  }

  render(): JSX.Element {
    const { lowerBound, marks, orientation, upperBound } = this.props

    return (
      <Slider
        defaultValue={this.getValues()}
        marks={convertMarks(marks)}
        max={upperBound}
        min={lowerBound}
        onChange={this.handleChange}
        range
        vertical={orientation === "vertical"}
      />
    )
  }
}

const convertMarks = (marks?: LabelValue[]): SliderMarks =>
  (marks || []).reduce(
    (acc, { label, value }) => (typeof value !== "undefined" ? set(value, { label }, acc) : acc),
    {} as SliderMarks
  )
