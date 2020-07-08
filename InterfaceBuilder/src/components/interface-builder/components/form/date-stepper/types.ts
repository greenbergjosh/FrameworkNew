import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { ButtonProps } from "antd/lib/button"
import { Moment } from "moment"

export interface DateStepperInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-stepper"
  valueKeys: string[]
  isDateRange: boolean
  dateKey: string
  startDateKey: string
  endDateKey: string
  size: ButtonProps["size"]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  submit: UserInterfaceProps["submit"]
  executeImmediately: boolean
}

export interface DateStepperInterfaceComponentState {}

export type DateAction = (date: Moment, bound: "start" | "end" | "none") => string

export type DateValuesType = { [p: string]: string }
