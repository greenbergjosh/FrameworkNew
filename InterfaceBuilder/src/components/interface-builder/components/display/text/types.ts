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
  stringTemplate: string
  useTokens: boolean
  textType: "text" | "paragraph" | "code" | "title"
  headerSize?: string
  center?: boolean
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
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
