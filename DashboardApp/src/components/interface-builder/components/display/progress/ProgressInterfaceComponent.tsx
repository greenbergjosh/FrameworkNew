import { Progress } from "antd"
import { ProgressProps, ProgressSize } from "antd/lib/progress/progress"
import { get } from "lodash/fp"
import React from "react"
import { TSEnum } from "../../../../../@types/ts-enum"
import { UserInterfaceProps } from "../../../UserInterface"
import { progressManageForm } from "./progress-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

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

export class ProgressInterfaceComponent extends BaseInterfaceComponent<
  ProgressInterfaceComponentProps
> {
  static defaultProps = {
    defaultValue: 0,
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "progress",
      title: "Progress",
      icon: "loading-3-quarters",
      componentDefinition: {
        component: "progress",
      },
    }
  }

  static manageForm = progressManageForm

  render() {
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
      userInterfaceData,
      valueKey,
      width,
    } = this.props

    // Determine Status
    const statusValue = statusKey && get(statusKey, userInterfaceData)
    const status =
      forceStatus === "useAPI" ? mapStatus(statuses || STATUS, statusValue) : forceStatus

    // Determine Value
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    let percent = value
    let format

    // Calculate percent, if necessary
    if (calculatePercent) {
      const rawTotal = get(maxValueKey, userInterfaceData)
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
