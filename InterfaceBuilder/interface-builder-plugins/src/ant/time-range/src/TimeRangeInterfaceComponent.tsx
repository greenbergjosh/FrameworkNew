import moment from "moment"
import React from "react"
import { set } from "lodash/fp"
import { TimePicker } from "antd"
import { timeRangeManageForm } from "./time-range-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  Undraggable,
  UserInterfaceProps,
} from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"
import { TimePickerProps } from "antd/es/time-picker"

export interface TimeRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "timeRange"
  defaultRangeValue: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  startTimeKey: string
  endTimeKey: string
  size?: "small" | "default" | "large" | undefined
  startTimePlaceholder: string
  endTimePlaceholder: string
}

const TIMEFORMAT = "h:mm a"

export default class TimeRangeInterfaceComponent extends BaseInterfaceComponent<TimeRangeInterfaceComponentProps> {
  static defaultProps = {
    startTimeKey: "startTime",
    endTimeKey: "endTime",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = timeRangeManageForm

  static getDefinitionDefaultValue({ endTimeKey, startTimeKey }: TimeRangeInterfaceComponentProps) {
    const startTime = moment.utc()
    const endTime = startTime
    return set(startTimeKey, startTime.toISOString(), set(endTimeKey, endTime.toISOString(), {}))
  }

  constructor(props: TimeRangeInterfaceComponentProps) {
    super(props)
  }

  private setUIDataByKey(time: moment.Moment, timeKey: string) {
    const timeValue = time ? time.format("LT") : undefined
    this.setValue([timeKey, timeValue])
  }

  handleStartTimeChange: TimePickerProps["onChange"] = (time: any): void => {
    this.setUIDataByKey(time, this.props.startTimeKey)
  }

  handleEndTimeChange: TimePickerProps["onChange"] = (time: any): void => {
    this.setUIDataByKey(time, this.props.endTimeKey)
  }

  getTimeValue = (timeKey: string) => {
    const timeValue = this.getValue(timeKey)
    return typeof timeValue !== "undefined" ? moment.utc(timeValue, TIMEFORMAT) : undefined
  }

  getDefaultValue = (): moment.Moment => {
    return moment("00:00:00", "HH:mm:ss")
  }

  render(): JSX.Element {
    const { size, endTimePlaceholder, startTimePlaceholder, startTimeKey, endTimeKey } = this.props

    return (
      <>
        <Undraggable wrap="shrink">
          <TimePicker
            value={this.getTimeValue(startTimeKey)}
            placeholder={startTimePlaceholder}
            format={TIMEFORMAT}
            onChange={this.handleStartTimeChange}
            defaultOpenValue={this.getDefaultValue()}
            size={size}
            use12Hours
          />
        </Undraggable>
        <span>&nbsp;to&nbsp;</span>
        <Undraggable wrap="shrink">
          <TimePicker
            value={this.getTimeValue(endTimeKey)}
            placeholder={endTimePlaceholder}
            format={TIMEFORMAT}
            onChange={this.handleEndTimeChange}
            defaultOpenValue={this.getDefaultValue()}
            size={size}
            use12Hours
          />
        </Undraggable>
      </>
    )
  }
}
