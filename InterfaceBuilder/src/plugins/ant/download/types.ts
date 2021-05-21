import { buttonDisplayType, shapeType, sizeType } from "../../../plugins/ant/download/download-manage-form"
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

export type ParamKVPMapsType = { values: { fieldName: string; valueKey: string }[] }

export interface DownloadInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "button"
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]

  /* Local props */
  block: boolean
  buttonLabel: string
  defaultValue?: string
  displayType: buttonDisplayType
  filename: string
  ghost: boolean
  hideButtonLabel: boolean
  httpMethod: "GET" | "POST"
  icon: string
  paramKVPMaps: ParamKVPMapsType
  paramsValueKey: string
  placeholder: string
  shape: shapeType
  size: sizeType
  url: string
  useFilenameFromServer: boolean
}

export interface DownloadInterfaceComponentState {
  isDownloading: boolean
}
