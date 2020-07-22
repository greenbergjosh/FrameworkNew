import React from "react"
import { Form, TimePicker } from "antd"
import { get, set, throttle } from "lodash/fp"
import moment from "moment"
import { timeRangeManageForm } from "./time-range-manage-form"
import { UserInterfaceProps } from "../../../UserInterface"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"
import { Undraggable } from "components/interface-builder/components/_shared/Undraggable"

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

interface TimeRangeInterfaceComponentState {}

const TIMEFORMAT = "h:mm a"

export class TimeRangeInterfaceComponent extends BaseInterfaceComponent<
  TimeRangeInterfaceComponentProps
> {
  static defaultProps = {
    startTimeKey: "startTime",
    endTimeKey: "endTime",
  }

  static getLayoutDefinition() {
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

  static getDefintionDefaultValue({ endTimeKey, startTimeKey }: TimeRangeInterfaceComponentProps) {
    const startTime = moment.utc()
    const endTime = startTime
    return set(startTimeKey, startTime.toISOString(), set(endTimeKey, endTime.toISOString(), {}))
  }

  constructor(props: TimeRangeInterfaceComponentProps) {
    super(props)
  }

  private setUIDataByKey(time: moment.Moment, timeKey: string) {
    const { onChangeData, userInterfaceData } = this.props
    const timeValue = time ? time.format("LT") : undefined
    onChangeData && onChangeData(set(timeKey, timeValue, userInterfaceData))
  }

  handleStartTimeChange = (time: moment.Moment, timeString: string) => {
    this.setUIDataByKey(time, this.props.startTimeKey)
  }

  handleEndTimeChange = (time: moment.Moment, timeString: string) => {
    this.setUIDataByKey(time, this.props.endTimeKey)
  }

  getValue = (timeKey: string) => {
    const { userInterfaceData } = this.props
    const timeValue = get(timeKey, userInterfaceData)
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
            value={this.getValue(startTimeKey)}
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
            value={this.getValue(endTimeKey)}
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
