import { DatePicker } from "antd"
import moment from "moment"
import React from "react"
import { getTimeFormat, TimeSettings } from "@opg/interface-builder-plugins/lib/ant/shared"
import { settings } from "./settings"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  Undraggable,
  UserInterfaceProps,
} from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"
import { SinglePickerProps } from "antd/es/date-picker/interface"

export interface DateInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-range"
  timeSettings?: TimeSettings

  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

interface DateInterfaceComponentState {}

export default class DateInterfaceComponent extends BaseInterfaceComponent<
  DateInterfaceComponentProps,
  DateInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "date",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  handleChange: SinglePickerProps["onChange"] = (inputMoment, dateString) => {
    const { onChangeData, timeSettings, valueKey } = this.props
    const timeFormat = getTimeFormat(timeSettings)
    const newValueMoment = moment(dateString, `YYYY-MM-DD${timeFormat ? ` ${timeFormat.format}` : ""}`)
    const currentValue = this.getValue(valueKey)

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

    const newValue = newValueMoment.isValid() ? newValueMoment.startOf(alignmentTimePeriod).utc().toISOString() : null

    if (currentValue !== newValue && onChangeData) {
      this.setValue([valueKey, newValue])
    }
  }

  render(): JSX.Element {
    const value = this.getValue(this.props.valueKey)
    const timeFormat = getTimeFormat(this.props.timeSettings)
    return (
      <Undraggable wrap>
        <DatePicker
          format={`YYYY-MM-DD${timeFormat ? ` ${timeFormat.format}` : ""}`}
          onChange={this.handleChange}
          showTime={timeFormat}
          style={{ display: "block" }}
          value={moment.utc(value || undefined).local()}
        />
      </Undraggable>
    )
  }
}
