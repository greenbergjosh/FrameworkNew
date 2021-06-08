import { ComponentDefinition, UserInterfaceContextManager } from "../globalTypes"

interface IUserInterfaceProps {
  data?: any // Includes but not limited to: string | number | boolean | JSONRecord | JSONRecord[] | null | undefined
  contextManager?: UserInterfaceContextManager
  mode: "display" | "edit" | "preview"
  onChangeData?: (data: UserInterfaceProps["data"]) => void
  components: ComponentDefinition[]
  submit?: () => void
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  onChangeRootData: (newData: UserInterfaceProps["data"]) => void
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
