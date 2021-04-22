import { buttonDisplayType, shapeType, sizeType } from "../../../plugins/ant/button/button-manage-form"
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

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
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
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
}

export interface ButtonInterfaceComponentState {
  isShowingConfirmation: boolean
}
