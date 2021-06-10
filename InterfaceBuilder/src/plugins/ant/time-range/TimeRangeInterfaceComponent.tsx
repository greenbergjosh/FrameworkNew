import React from "react"
import { TimePicker } from "antd"
import { set } from "lodash/fp"
import moment from "moment"
import { timeRangeManageForm } from "./time-range-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { Undraggable } from "components/DragAndDrop/Undraggable"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

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

export class TimeRangeInterfaceComponent extends BaseInterfaceComponent<TimeRangeInterfaceComponentProps> {
  static defaultProps = {
    startTimeKey: "startTime",
    endTimeKey: "endTime",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Form",
      name: "time-range",
      title: "Time Range",
      icon: "clock-circle",
      formControl: true,
      componentDefinition: {
        component: "time-range",
        label: "Time Range",
      },
    }
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

  handleStartTimeChange = (time: moment.Moment): void => {
    this.setUIDataByKey(time, this.props.startTimeKey)
  }

  handleEndTimeChange = (time: moment.Moment): void => {
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
