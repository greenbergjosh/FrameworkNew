import { buttonDisplayType, shapeType, sizeType } from "../../../plugins/ant/download/download-manage-form"
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

export type ParamKVPMapsType = { values: { fieldName: string; valueKey: string }[] }

export interface DownloadInterfaceComponentProps extends ComponentDefinitionNamedProps {
  block: boolean
  buttonLabel: string
  component: "button"
  defaultValue?: string
  displayType: buttonDisplayType
  filename: string
  ghost: boolean
  hideButtonLabel: boolean
  httpMethod: "GET" | "POST"
  icon: string
  onChangeData: UserInterfaceProps["onChangeData"]
  paramKVPMaps: ParamKVPMapsType
  paramsValueKey: string
  placeholder: string
  shape: shapeType
  size: sizeType
  url: string
  useFilenameFromServer: boolean
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
}

export interface DownloadInterfaceComponentState {
  isDownloading: boolean
}
