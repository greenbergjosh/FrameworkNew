import { ButtonProps } from "antd/lib/button"
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"
import { Moment } from "moment"

export type DateFormat = "iso-8601" | "locale" | "gmt" | undefined

export interface DateStepperInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-stepper"
  valueKeys: string[]
  isDateRange: boolean
  dateKey: string
  startDateKey: string
  dateFormat: DateFormat
  endDateKey: string
  size: ButtonProps["size"]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
}

export interface DateStepperInterfaceComponentState {}

export type DateAction = (date: Moment, dateFormat: DateFormat, bound: "start" | "end" | "none") => string

export type DateValuesType = { [p: string]: string }
