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

export interface DateRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-range"
  defaultRangeValue: string
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
    return set(startDateKey, startDate, set(endDateKey, endDate, {}))
  }

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

  handleChange = (dates: RangePickerValue, dateStrings: [string, string]) => {
    const { endDateKey, startDateKey, onChangeData, userInterfaceData } = this.props

    const startDate = Array.isArray(dates) && dates[0] ? dates[0].toISOString() : null
    const endDate = Array.isArray(dates) && dates[1] ? dates[1].toISOString() : null

    onChangeData &&
      onChangeData(set(startDateKey, startDate, set(endDateKey, endDate, userInterfaceData)))
  }

  getValues = () => {
    const { endDateKey, startDateKey, userInterfaceData } = this.props

    return [get(startDateKey, userInterfaceData), get(endDateKey, userInterfaceData)]
  }

  render(): JSX.Element {
    const [startDateValue, endDateValue] = this.getValues()
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
