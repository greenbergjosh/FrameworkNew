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

export interface ProgressInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "progress"
  valueKey: string
  calculatePercent: boolean
  hideInfo?: boolean
  indicateStatus: boolean
  maxValueKey: string
  smallLine: boolean
  statusActive: string
  statusException: string
  statusKey: string
  statusSuccess: string
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
      hideInfo,
      indicateStatus,
      maxValueKey,
      smallLine,
      statusActive,
      statusException,
      statusKey,
      statusSuccess,
      successPercent,
      type,
      userInterfaceData,
      valueKey,
      width,
    } = this.props

    const rawValue = get(valueKey, userInterfaceData)
    const statusValue = get(statusKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    let percent = value
    let status = STATUS.normal
    let format

    if (indicateStatus) {
      switch (statusValue) {
        case statusSuccess:
          status = STATUS.success
          break
        case statusException:
          status = STATUS.exception
          break
        case statusActive:
          status = STATUS.active
          break
        default:
          status = STATUS.normal
      }
    }

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
