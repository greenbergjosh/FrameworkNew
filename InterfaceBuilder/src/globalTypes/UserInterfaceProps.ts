import { ComponentDefinition, UserInterfaceContextManager } from "../globalTypes"

interface IUserInterfaceProps {
  data?: any
  contextManager?: UserInterfaceContextManager
  mode: "display" | "edit" | "preview"
  onChangeData?: (data: UserInterfaceProps["data"], isTargetingRoot?: boolean) => void
  components: ComponentDefinition[]
  submit?: () => void
  getRootUserInterfaceData?: () => UserInterfaceProps["data"]
  keyPrefix?: string
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
