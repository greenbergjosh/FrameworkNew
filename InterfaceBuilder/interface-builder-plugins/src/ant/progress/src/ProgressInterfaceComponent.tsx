import React from "react"
import { Progress } from "antd"
import { progressManageForm } from "./progress-manage-form"
import { ProgressProps, ProgressSize } from "antd/lib/progress/progress"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  TSEnum,
  UserInterfaceProps,
} from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"

const STATUS: TSEnum<ProgressProps["status"]> = {
  success: "success",
  exception: "exception",
  normal: "normal",
  active: "active",
}

const SIZE: TSEnum<ProgressSize> = {
  default: "default",
  small: "small",
}

interface ProgressStatuses {
  active?: string
  exception?: string
  normal?: string
  success?: string
}

export interface ProgressInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "progress"
  valueKey: string
  calculatePercent: boolean
  hideInfo?: boolean
  forceStatus: ProgressProps["status"] | "useAPI"
  maxValueKey: string
  smallLine: boolean
  statuses?: ProgressStatuses
  statusKey?: string
  successPercent?: number
  type: "line" | "circle" | "dashboard"
  userInterfaceData: UserInterfaceProps["data"]
  width?: number
}

export default class ProgressInterfaceComponent extends BaseInterfaceComponent<ProgressInterfaceComponentProps> {
  static defaultProps = {
    defaultValue: 0,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = progressManageForm

  render(): JSX.Element {
    const {
      calculatePercent,
      defaultValue,
      forceStatus,
      hideInfo,
      maxValueKey,
      smallLine,
      statusKey,
      statuses,
      successPercent,
      type,
      valueKey,
      width,
    } = this.props

    // Determine Status
    const statusValue = statusKey && this.getValue(statusKey)
    const status = forceStatus === "useAPI" ? mapStatus(statuses || STATUS, statusValue) : forceStatus

    // Determine Value
    const rawValue = this.getValue(valueKey)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    let percent = value
    let format

    // Calculate percent, if necessary
    if (calculatePercent) {
      const rawTotal = this.getValue(maxValueKey)
      const total = typeof rawTotal !== "undefined" ? rawTotal : defaultValue
      percent = Math.round((value / total) * 100)
      format = () => `${value}/${total}`
    }

    return (
      <Progress
        format={format}
        percent={percent}
        showInfo={!hideInfo}
        size={smallLine ? SIZE.small : SIZE.default}
        status={status}
        successPercent={successPercent}
        type={type}
        width={width}
      />
    )
  }
}

const mapStatus = (statuses: ProgressStatuses, statusValue: string) => {
  console.log("Progress", statuses, statusValue)
  switch (statusValue) {
    case statuses.success:
      return STATUS.success
    case statuses.exception:
      return STATUS.exception
    case statuses.active:
      return STATUS.active
    default:
      return STATUS.normal
  }
}
