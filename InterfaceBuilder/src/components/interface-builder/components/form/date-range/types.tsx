import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { TimeSettings } from "components/interface-builder/components/form/_shared/common-include-time-form"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export interface DateRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-range"
  defaultRangeValue: string
  timeSettings?: TimeSettings

  onChangeData: UserInterfaceProps["onChangeData"]
  startDateKey: string
  endDateKey: string
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
}

export interface DateRangeInterfaceComponentState {}

export enum EVENTS {
  VALUE_CHANGED = "valueChanged",
}
