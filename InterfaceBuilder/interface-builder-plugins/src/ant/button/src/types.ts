import { buttonDisplayType, shapeType, sizeType } from "./settings"
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"

export type ParamKVPMapsType = { values: { sourceKey: string; targetKey: string }[] }

interface ConfirmationProps {
  title?: string
  message?: string
  okText?: string
  cancelText?: string
}

export interface ButtonInterfaceComponentProps extends ComponentDefinitionNamedProps {
  paramKVPMaps: ParamKVPMapsType
  component: "button"
  requireConfirmation: boolean
  confirmation?: ConfirmationProps
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  // valueKey: string
  buttonLabel: string
  icon: string
  hideButtonLabel: boolean
  shape: shapeType
  size: sizeType
  displayType: buttonDisplayType
  block: boolean
  ghost: boolean
  disabled: boolean
  loading: boolean
  useOnClick: boolean
  onClickSrc?: string
}

export interface ButtonInterfaceComponentState {
  isShowingConfirmation: boolean
}

export enum EVENTS {
  CLICK = "click",
}
