import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { CSSProperties } from "react"

export interface TextInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // Core props
  component: "text"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string

  // Additional props
  banner?: boolean
  center?: boolean
  closable?: boolean
  description?: string
  headerSize?: string
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  showIcon?: boolean
  stringTemplate: string
  textType: "text" | "paragraph" | "code" | "title" | "success" | "info" | "warning" | "error"
  useTokens: boolean
}

export interface TextInterfaceComponentState {
  text: string | null
}

export type TitleSizeType = 1 | 2 | 3 | 4 | undefined

export interface TextDisplayProps {
  text: string | null
  style: CSSProperties
  size?: TitleSizeType
}

export interface AlertDisplayProps extends TextDisplayProps{
  banner?: boolean
  closable?: boolean
  description?: string
  showIcon?: boolean
}
