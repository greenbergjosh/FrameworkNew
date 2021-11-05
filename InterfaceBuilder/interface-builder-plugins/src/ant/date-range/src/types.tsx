import { TimeSettings } from "@opg/interface-builder-plugins/lib/ant/shared"
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"

export interface DateRangeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "date-range"
  defaultRangeValue: string
  timeSettings?: TimeSettings

  onChangeData: UserInterfaceProps["onChangeData"]
  startDateKey: string
  endDateKey: string
}

export interface DateRangeInterfaceComponentState {}

export enum EVENTS {
  VALUE_CHANGED = "valueChanged",
}
