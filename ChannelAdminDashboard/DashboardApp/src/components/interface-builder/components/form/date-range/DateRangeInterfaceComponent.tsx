import { DatePicker } from "antd"
import { RangePickerValue } from "antd/lib/date-picker/interface"
import moment from "moment"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { dateRangeManageForm } from "./date-range-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

export interface DateRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-range"
  defaultRangeValue: string
  onChangeData: UserInterfaceProps["onChangeData"]
  startDateKey: string
  endDateKey: string
  userInterfaceData: UserInterfaceProps["data"]
  useWrapperObject?: boolean
  wrapperObjectKey?: string
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
    useWrapperObject,
    wrapperObjectKey,
  }: DateRangeInterfaceComponentProps) {
    const [startDate, endDate] = this.standardRanges()[defaultRangeValue]
    const defaultValue = {
      [startDateKey]: startDate,
      [endDateKey]: endDate,
    }

    return useWrapperObject && wrapperObjectKey
      ? { [wrapperObjectKey]: defaultValue }
      : defaultValue
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
    const {
      endDateKey,
      startDateKey,
      onChangeData,
      userInterfaceData,
      useWrapperObject,
      wrapperObjectKey,
    } = this.props

    const newValue = {
      [startDateKey]: Array.isArray(dates) && dates[0] ? dates[0].toISOString() : null,
      [endDateKey]: Array.isArray(dates) && dates[1] ? dates[1].toISOString() : null,
    }

    const finalObject =
      useWrapperObject && wrapperObjectKey ? { [wrapperObjectKey]: newValue } : newValue

    onChangeData &&
      onChangeData({
        ...userInterfaceData,
        ...finalObject,
      })
  }

  getValues = () => {
    const {
      endDateKey,
      startDateKey,
      userInterfaceData,
      useWrapperObject,
      wrapperObjectKey,
    } = this.props

    const wrapper =
      useWrapperObject && wrapperObjectKey ? userInterfaceData[wrapperObjectKey] : userInterfaceData

    return [wrapper[startDateKey], wrapper[endDateKey]]
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
