import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import {
  buttonDisplayType,
  shapeType,
  sizeType,
} from "components/interface-builder/components/form/download/download-manage-form"

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
}

export interface DownloadInterfaceComponentState {
  isDownloading: boolean
}
