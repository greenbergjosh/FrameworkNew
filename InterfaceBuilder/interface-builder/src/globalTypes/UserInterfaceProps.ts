import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceContextManager } from "../globalTypes"
import { JSONRecord } from "../globalTypes/JSONTypes"

export type UserInterfaceDataType = string | number | boolean | JSONRecord | JSONRecord[] | null | undefined

interface IUserInterfaceProps {
  data?: any // Includes but not limited to: string | number | boolean | JSONRecord | JSONRecord[] | null | undefined
  contextManager?: UserInterfaceContextManager
  mode: "display" | "edit" | "preview"
  onChangeData?: (data: UserInterfaceProps["data"]) => void
  components: ComponentDefinition[]
  getComponents?: () => ComponentDefinition[] // See CHN-551 Workaround
  submit?: () => void
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  onChangeRootData: (newData: UserInterfaceProps["data"]) => void
  onVisibilityChange?: (
    mode: "visible" | "hidden" | "blocked" | "invisible",
    cmpDef: ComponentDefinitionNamedProps,
    data: UserInterfaceProps["data"]
  ) => void
  keyPrefix?: string
  hideMenu?: boolean
  title?: string
}

export interface DisplayUserInterfaceProps extends IUserInterfaceProps {
  mode: "display"
}

export interface PreviewUserInterfaceProps extends IUserInterfaceProps {
  mode: "preview"
}

export interface EditUserInterfaceProps extends IUserInterfaceProps {
  mode: "edit"
  onChangeSchema: (schema: ComponentDefinition[]) => void
}

export type UserInterfaceProps = DisplayUserInterfaceProps | EditUserInterfaceProps | PreviewUserInterfaceProps
