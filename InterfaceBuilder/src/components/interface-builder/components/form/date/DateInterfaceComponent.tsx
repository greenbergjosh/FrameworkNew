import { DatePicker } from "antd"
import { get, set } from "lodash/fp"
import moment from "moment"
import React from "react"
import { getTimeFormat, TimeSettings } from "../_shared/common-include-time-form"
import { UserInterfaceProps } from "../../../UserInterface"
import { dateManageForm } from "./date-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"
import { Undraggable } from "../../_shared/Undraggable"

export interface DateInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-range"
  timeSettings?: TimeSettings

  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

interface DateInterfaceComponentState {}

export class DateInterfaceComponent extends BaseInterfaceComponent<
  DateInterfaceComponentProps,
  DateInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "date",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "date",
      title: "Date",
      icon: "calendar",
      formControl: true,
      componentDefinition: {
        component: "date",
        label: "Date",
      },
    }
  }

  static manageForm = dateManageForm

  handleChange = (inputMoment: moment.Moment | null, dateString: string) => {
    const { onChangeData, timeSettings, userInterfaceData, valueKey } = this.props
    const timeFormat = getTimeFormat(timeSettings)
    const newValueMoment = moment(
      dateString,
      "YYYY-MM-DD" + (timeFormat ? " " + timeFormat.format : "")
    )
    const currentValue = get(valueKey, userInterfaceData)

    const { includeTime } = timeSettings || { includeTime: false }

    const alignmentTimePeriod =
      timeSettings && includeTime
        ? timeSettings.includeSecond
          ? "second"
          : timeSettings.includeMinute
          ? "minute"
          : timeSettings.includeHour
          ? "hour"
          : "day"
        : "day"

    const newValue = newValueMoment.isValid()
      ? newValueMoment
          .startOf(alignmentTimePeriod)
          .utc()
          .toISOString()
      : null

    if (currentValue !== newValue && onChangeData) {
      console.log("DateInterfaceComponent", { inputMoment, dateString, newValueMoment })
      onChangeData(set(valueKey, newValue, userInterfaceData))
    }
  }

  render(): JSX.Element {
    const { timeSettings, userInterfaceData, valueKey } = this.props
    const value = get(valueKey, userInterfaceData)
    const timeFormat = getTimeFormat(timeSettings)
    return (
      <Undraggable wrap>
        <DatePicker
          format={"YYYY-MM-DD" + (timeFormat ? " " + timeFormat.format : "")}
          onChange={this.handleChange}
          showTime={timeFormat}
          style={{ display: "block" }}
          value={moment.utc(value || undefined).local()}
        />
      </Undraggable>
    )
  }
}
