import { Slider } from "antd"
import { SliderMarks, SliderValue } from "antd/lib/slider"
import { get, set } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { numberRangeManageForm } from "./number-range-manage-form"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent"

interface LabelValue {
  label?: string
  value?: number
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

export class NumberRangeInterfaceComponent extends BaseInterfaceComponent<
  NumberRangeInterfaceComponentProps,
  NumberRangeInterfaceComponentState
> {
  static defaultProps = {
    startKey: "start",
    endKey: "end",
    orientation: "horizontal",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "number-range",
      title: "Number Range",
      icon: "control",
      formControl: true,
      componentDefinition: {
        component: "number-range",
        label: "Number Range",
      },
    }
  }

  static manageForm = numberRangeManageForm

  static getDefintionDefaultValue({
    defaultRangeValueType,
    defaultRangeLowerValue,
    defaultRangeUpperValue,
    lowerBound,
    upperBound,
    endKey,
    startKey,
  }: NumberRangeInterfaceComponentProps) {
    console.log("NumberRangeInterfaceComponent.getDefaultValue", {
      defaultRangeValueType,
      defaultRangeLowerValue,
      defaultRangeUpperValue,
      lowerBound,
      upperBound,
      endKey,
      startKey,
    })

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
    const { endKey, startKey, onChangeData, userInterfaceData } = this.props

    if (Array.isArray(value)) {
      onChangeData && onChangeData(set(startKey, value[0], set(endKey, value[1], userInterfaceData)))
    }
  }

  getDefaultValue = () => {
    return NumberRangeInterfaceComponent.getDefintionDefaultValue(this.props)
  }

  getValues = (): [number, number] => {
    const { endKey, startKey, userInterfaceData } = this.props

    return [get(startKey, userInterfaceData), get(endKey, userInterfaceData)]
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
