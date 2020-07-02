import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { ButtonProps } from "antd/lib/button"

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
}

export interface DateStepperInterfaceComponentState {}
