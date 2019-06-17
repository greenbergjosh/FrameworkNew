import { DatePicker } from "antd"
import { RangePickerValue } from "antd/lib/date-picker/interface"
import moment from "moment"
import React from "react"
import { dateRangeManageForm } from "./date-range-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface DateRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-range"
  startDateKey: string
  endDateKey: string
}

interface DateRangeInterfaceComponentState {
  _unrollValue: boolean
  data: { [key: string]: string | null }
}

export class DateRangeInterfaceComponent extends BaseInterfaceComponent<
  DateRangeInterfaceComponentProps,
  DateRangeInterfaceComponentState
> {
  static defaultProps = {
    startDateKey: "startData",
    endDateKey: "endDate",
  }

  static getLayoutDefinition() {
    return {
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

  constructor(props: DateRangeInterfaceComponentProps) {
    super(props)

    this.state = {
      _unrollValue: true,
      data: {},
    }
  }

  handleChange = (dates: RangePickerValue, dateStrings: [string, string]) => {
    this.setState({
      data: {
        [this.props.startDateKey]: Array.isArray(dates) && dates[0] ? dates[0].toISOString() : null,
        [this.props.endDateKey]: Array.isArray(dates) && dates[1] ? dates[1].toISOString() : null,
      },
    })
  }

  render(): JSX.Element {
    const startDateValue = this.state.data[this.props.startDateKey]
    const endDateValue = this.state.data[this.props.endDateKey]
    const value = [moment.utc(startDateValue || undefined), moment.utc(endDateValue || undefined)]
    return (
      <DatePicker.RangePicker
        style={{ display: "block" }}
        ranges={DateRangeInterfaceComponent.standardRanges()}
        onChange={this.handleChange}
        value={[moment.utc(startDateValue || undefined), moment.utc(endDateValue || undefined)]}
      />
    )
  }
}
