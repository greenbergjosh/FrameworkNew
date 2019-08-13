import { DatePicker } from "antd"
import { RangePickerValue } from "antd/lib/date-picker/interface"
import { get, set } from "lodash/fp"
import moment from "moment"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { dateRangeManageForm } from "./date-range-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

interface TimeSettings {
  includeTime: boolean
  includeHour: boolean
  includeMinute: boolean
  includeSecond: boolean
  use24Clock: boolean
}

export interface DateRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-range"
  defaultRangeValue: string
  timeSettings?: TimeSettings

  onChangeData: UserInterfaceProps["onChangeData"]
  startDateKey: string
  endDateKey: string
  userInterfaceData: UserInterfaceProps["data"]
}

interface DateRangeInterfaceComponentState {}

export class DateRangeInterfaceComponent extends BaseInterfaceComponent<
  DateRangeInterfaceComponentProps,
  DateRangeInterfaceComponentState
> {
  static defaultProps = {
    startDateKey: "startDate",
    endDateKey: "endDate",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "date-range",
      title: "Date Range",
      icon: "calendar",
      formControl: true,
      componentDefinition: {
        component: "date-range",
        label: "Date Range",
      },
    }
  }

  static manageForm = dateRangeManageForm

  static getDefintionDefaultValue({
    defaultRangeValue,
    endDateKey,
    startDateKey,
  }: DateRangeInterfaceComponentProps) {
    const [startDate, endDate] = this.standardRanges()[defaultRangeValue]
    return set(startDateKey, startDate.toISOString(), set(endDateKey, endDate.toISOString(), {}))
  }

  static standardRanges(): { [range: string]: [moment.Moment, moment.Moment] } {
    const now = moment.utc()

    return {
      Today: [now.clone().startOf("day"), now.clone().endOf("day")],
      Yesterday: [
        now
          .clone()
          .subtract(1, "day")
          .startOf("day"),
        now
          .clone()
          .subtract(1, "day")
          .endOf("day"),
      ],
      "This Week": [
        now
          .clone()
          .startOf("week")
          .startOf("day"),
        now
          .clone()
          .endOf("week")
          .endOf("day"),
      ],
      "Last Week": [
        now
          .clone()
          .subtract(1, "week")
          .startOf("week")
          .startOf("day"),
        now
          .clone()
          .subtract(1, "week")
          .endOf("week")
          .endOf("day"),
      ],
      "This Month": [
        now
          .clone()
          .startOf("month")
          .startOf("day"),
        now
          .clone()
          .endOf("month")
          .endOf("day"),
      ],
      "Last Month": [
        now
          .clone()
          .subtract(1, "month")
          .startOf("month")
          .startOf("day"),
        now
          .clone()
          .subtract(1, "month")
          .endOf("month")
          .endOf("day"),
      ],
      YTD: [
        now
          .clone()
          .startOf("year")
          .startOf("day"),
        now.clone().endOf("day"),
      ],
    }
  }

  handleChange = (dates: RangePickerValue, dateStrings: [string, string]) => {
    const { endDateKey, startDateKey, onChangeData, timeSettings, userInterfaceData } = this.props

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

    const startDate =
      Array.isArray(dates) && dates[0] ? dates[0].startOf(alignmentTimePeriod).toISOString() : null
    const endDate =
      Array.isArray(dates) && dates[1] ? dates[1].endOf(alignmentTimePeriod).toISOString() : null

    onChangeData &&
      onChangeData(set(startDateKey, startDate, set(endDateKey, endDate, userInterfaceData)))
  }

  getDefaultValue = () => {
    return DateRangeInterfaceComponent.getDefintionDefaultValue(this.props)
  }

  getValues = () => {
    const { endDateKey, startDateKey, userInterfaceData } = this.props

    return [get(startDateKey, userInterfaceData), get(endDateKey, userInterfaceData)]
  }

  getTimeFormat = () => {
    const { timeSettings } = this.props
    if (timeSettings && timeSettings.includeTime) {
      const { includeHour, includeMinute, includeSecond, use24Clock } = timeSettings
      let formatString = ""
      if (includeHour) {
        formatString += (formatString.length ? ":" : "") + (use24Clock ? "HH" : "h")
      }
      if (includeMinute) {
        formatString += (formatString.length ? ":" : "") + "mm"
      }
      if (includeSecond) {
        formatString += (formatString.length ? ":" : "") + "ss"
      }
      if (!use24Clock) {
        formatString += (formatString.length ? " " : "") + "A"
      }

      if (formatString) {
        return { format: formatString, use12Hours: !use24Clock }
      }
    }

    return false
  }

  render(): JSX.Element {
    const [startDateValue, endDateValue] = this.getValues()
    const timeFormat = this.getTimeFormat()
    return (
      <DatePicker.RangePicker
        format={"YYYY-MM-DD" + (timeFormat ? " " + timeFormat.format : "")}
        onChange={this.handleChange}
        ranges={DateRangeInterfaceComponent.standardRanges()}
        showTime={timeFormat}
        style={{ display: "block" }}
        value={[moment.utc(startDateValue || undefined), moment.utc(endDateValue || undefined)]}
      />
    )
  }
}
