import { DatePicker } from "antd"
import { RangePickerValue } from "antd/lib/date-picker/interface"
import { get, isEmpty, set } from "lodash/fp"
import moment, { MomentInput } from "moment"
import React from "react"
import { getTimeFormat } from "@opg/interface-builder-plugins/lib/ant/shared"
import { settings } from "./settings"
import { BaseInterfaceComponent, LayoutDefinition, Undraggable } from "@opg/interface-builder"
import { DateRangeInterfaceComponentProps, DateRangeInterfaceComponentState, EVENTS } from "./types"
import layoutDefinition from "./layoutDefinition"

export default class DateRangeInterfaceComponent extends BaseInterfaceComponent<
  DateRangeInterfaceComponentProps,
  DateRangeInterfaceComponentState
> {
  static availableEvents = [EVENTS.VALUE_CHANGED]
  static defaultProps = {
    startDateKey: "startDate",
    endDateKey: "endDate",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

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
    const { endDateKey, startDateKey } = this.props
    const persistedStartDate = this.getValue(startDateKey)
    const persistedEndDate = this.getValue(endDateKey)

    if (isEmpty(persistedStartDate) && isEmpty(persistedEndDate)) {
      const range = this.getDefaultValue()
      const startDate = get(startDateKey, range)
      const endDate = get(endDateKey, range)

      this.setValue([
        [startDateKey, startDate],
        [endDateKey, endDate],
      ])
      this.raiseEvent(EVENTS.VALUE_CHANGED, { startDate, endDate })
    }
  }

  handleChange = (dates: RangePickerValue /*, dateStrings: [string, string]*/): void => {
    const { endDateKey, startDateKey, timeSettings } = this.props
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
    this.setValue([
      [startDateKey, startDate],
      [endDateKey, endDate],
    ])
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
          value={[
            moment.utc((startDateValue as MomentInput) || undefined),
            moment.utc((endDateValue as MomentInput) || undefined),
          ]}
        />
      </Undraggable>
    )
  }
}
