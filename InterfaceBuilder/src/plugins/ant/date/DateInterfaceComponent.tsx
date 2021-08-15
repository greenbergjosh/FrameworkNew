import { DatePicker } from "antd"
import moment from "moment"
import React from "react"
import { getTimeFormat, TimeSettings } from "../_shared/common-include-time-form"
import { dateManageForm } from "./date-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { Undraggable } from "../../../components/DragAndDrop/Undraggable"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

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

  static getLayoutDefinition(): LayoutDefinition {
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
