import { DatePicker } from "antd"
import { RangePickerValue } from "antd/lib/date-picker/interface"
import { get, set, isEmpty } from "lodash/fp"
import moment from "moment"
import React from "react"
import { getTimeFormat } from "../_shared/common-include-time-form"
import { dateRangeManageForm } from "./date-range-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { Undraggable } from "../../_shared/Undraggable"
import { DateRangeInterfaceComponentProps, DateRangeInterfaceComponentState, EVENTS } from "./types"

export class DateRangeInterfaceComponent extends BaseInterfaceComponent<
  DateRangeInterfaceComponentProps,
  DateRangeInterfaceComponentState
> {
  static availableEvents = [EVENTS.VALUE_CHANGED]
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

  static getDefinitionDefaultValue({ defaultRangeValue, endDateKey, startDateKey }: DateRangeInterfaceComponentProps) {
    const [startDate, endDate] = this.standardRanges()[defaultRangeValue]
    return set(startDateKey, startDate.toISOString(), set(endDateKey, endDate.toISOString(), {}))
  }

  static standardRanges(): { [range: string]: [moment.Moment, moment.Moment] } {
    const now = moment.utc()

    return {
      Today: [now.clone().startOf("day"), now.clone().endOf("day")],
      Yesterday: [now.clone().subtract(1, "day").startOf("day"), now.clone().subtract(1, "day").endOf("day")],
      "This Week": [now.clone().startOf("week").startOf("day"), now.clone().endOf("week").endOf("day")],
      "Last Week": [
        now.clone().subtract(1, "week").startOf("week").startOf("day"),
        now.clone().subtract(1, "week").endOf("week").endOf("day"),
      ],
      "This Month": [now.clone().startOf("month").startOf("day"), now.clone().endOf("month").endOf("day")],
      "Last Month": [
        now.clone().subtract(1, "month").startOf("month").startOf("day"),
        now.clone().subtract(1, "month").endOf("month").endOf("day"),
      ],
      YTD: [now.clone().startOf("year").startOf("day"), now.clone().endOf("day")],
    }
  }

  componentDidMount(): void {
    const { endDateKey, startDateKey, onChangeData, timeSettings, userInterfaceData } = this.props
    const persistedStartDate = this.getValue(startDateKey)
    const persistedEndDate = this.getValue(endDateKey)

    if (isEmpty(persistedStartDate) && isEmpty(persistedEndDate)) {
      const range = this.getDefaultValue()
      const startDate = get(startDateKey, range)
      const endDate = get(endDateKey, range)

      onChangeData && onChangeData(set(startDateKey, startDate, set(endDateKey, endDate, userInterfaceData)))
      this.raiseEvent(EVENTS.VALUE_CHANGED, { startDate, endDate })
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
    const startDate = Array.isArray(dates) && dates[0] ? dates[0].startOf(alignmentTimePeriod).toISOString() : null
    const endDate = Array.isArray(dates) && dates[1] ? dates[1].endOf(alignmentTimePeriod).toISOString() : null

    onChangeData && onChangeData(set(startDateKey, startDate, set(endDateKey, endDate, userInterfaceData)))
  }

  getDefaultValue = () => {
    return DateRangeInterfaceComponent.getDefinitionDefaultValue(this.props)
  }

  render(): JSX.Element {
    const { timeSettings, startDateKey, endDateKey } = this.props
    const startDateValue = this.getValue(startDateKey)
    const endDateValue = this.getValue(endDateKey)
    const timeFormat = getTimeFormat(timeSettings)
    return (
      <Undraggable wrap>
        <DatePicker.RangePicker
          format={`YYYY-MM-DD${timeFormat ? ` ${timeFormat.format}` : ""}`}
          onChange={this.handleChange}
          ranges={DateRangeInterfaceComponent.standardRanges()}
          showTime={timeFormat}
          style={{ display: "block" }}
          value={[moment.utc(startDateValue || undefined), moment.utc(endDateValue || undefined)]}
        />
      </Undraggable>
    )
  }
}
