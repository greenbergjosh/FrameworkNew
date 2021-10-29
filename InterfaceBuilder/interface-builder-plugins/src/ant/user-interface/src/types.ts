import {
  ComponentDefinitionNamedProps,
  UserInterfaceProps,
  AbstractBaseInterfaceComponentType,
} from "@opg/interface-builder"

export interface UserInterfaceInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "user-interface"
  defaultDataValue?: any
  defaultValue?: any[]
  hideMenu: boolean
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  submit: UserInterfaceProps["submit"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

export interface UserInterfaceWrapperProps {
  defaultDataValue?: any
  defaultValue?: any[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  getValue: AbstractBaseInterfaceComponentType["prototype"]["getValue"]
  hideMenu: boolean
  label?: string
  mode: UserInterfaceProps["mode"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  setValue: AbstractBaseInterfaceComponentType["prototype"]["setValue"]
  submit: UserInterfaceProps["submit"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}
