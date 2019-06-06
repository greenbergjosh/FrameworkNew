import { DatePicker } from "antd"
import { RangePickerValue } from "antd/lib/date-picker/interface"
import moment from "moment"
import React from "react"
import ReactFormBase from "../ReactFormBase"
import editForm from "./date-range.form"

type ISO8601String = string

interface DateRangeOptions {
  value: {
    _unrollValue: boolean
    data: {
      [key: string]: ISO8601String | null
    }
  }
}

export default class DateRangeFormComponent extends ReactFormBase<DateRangeOptions> {
  static schema(...extend: any[]) {
    return ReactFormBase.schema(
      {
        type: "date-range",
        label: "Date Range",
      },
      ...extend
    )
  }

  static builderInfo = {
    title: "Date Range",
    group: "basic",
    icon: "fa fa-calendar",
    weight: 55,
    schema: DateRangeFormComponent.schema(),
  }

  static editForm = editForm

  static standardRanges(): { [range: string]: [moment.Moment, moment.Moment] } {
    const now = moment.utc()

    return {
      Today: [now.clone(), now.clone()],
      Yesterday: [now.clone().subtract(1, "day"), now.clone().subtract(1, "day")],
      "This Week": [now.clone().startOf("week"), now.clone().endOf("week")],
      "Last Week": [
        now
          .clone()
          .subtract(1, "week")
          .startOf("week"),
        now
          .clone()
          .subtract(1, "week")
          .endOf("week"),
      ],
      "This Month": [now.clone().startOf("month"), now.clone().endOf("month")],
      "Last Month": [
        now
          .clone()
          .subtract(1, "month")
          .startOf("month"),
        now
          .clone()
          .subtract(1, "month")
          .endOf("month"),
      ],
      YTD: [now.clone().startOf("year"), now.clone()],
    }
  }

  elementInfo() {
    const info = super.elementInfo()
    info.changeEvent = "change"
    return info
  }

  constructor(component: any, options: any, data: any) {
    super(component, options, data)
    const range = DateRangeFormComponent.standardRanges()[component.defaultRangeValue]

    this.state = {
      value: {
        _unrollValue: true,
        data: {
          [component.startDateKey]:
            Array.isArray(range) && range[0] ? range[0].toISOString() : null,
          [component.endDateKey]: Array.isArray(range) && range[1] ? range[1].toISOString() : null,
        },
      },
    }
  }

  handleChange = (dates: RangePickerValue, dateStrings: [string, string]) => {
    this.setValue({
      _unrollValue: true,
      data: {
        [this.component.startDateKey]:
          Array.isArray(dates) && dates[0] ? dates[0].toISOString() : null,
        [this.component.endDateKey]:
          Array.isArray(dates) && dates[1] ? dates[1].toISOString() : null,
      },
    })
  }

  render(): JSX.Element {
    const startDateValue = this.state.value.data[this.component.startDateKey]
    const endDateValue = this.state.value.data[this.component.endDateKey]
    const value = [moment.utc(startDateValue || undefined), moment.utc(endDateValue || undefined)]
    return (
      <DatePicker.RangePicker
        ranges={DateRangeFormComponent.standardRanges()}
        onChange={this.handleChange}
        value={[moment.utc(startDateValue || undefined), moment.utc(endDateValue || undefined)]}
      />
    )
  }

  isEmpty(value: DateRangeOptions["value"]) {
    return (
      !value ||
      !value.data ||
      (!value.data[this.component.startDateKey] && !value.data[this.component.endDateKey])
    )
  }

  get emptyValue() {
    const range = DateRangeFormComponent.standardRanges()[this.component.defaultRangeValue]

    return {
      _unrollValue: true,
      data: {
        [this.component.startDateKey]:
          Array.isArray(range) && range[0] ? range[0].toISOString() : null,
        [this.component.endDateKey]:
          Array.isArray(range) && range[1] ? range[1].toISOString() : null,
      },
    }
  }

  setValue(value: DateRangeOptions["value"]) {
    super.setValue(value)
  }

  get defaultSchema() {
    return DateRangeFormComponent.schema()
  }
}
