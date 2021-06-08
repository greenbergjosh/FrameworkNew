import { ComponentDefinitionNamedProps, EditorTheme, UserInterfaceProps } from "@opg/interface-builder"

export interface PathEditorInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "path-editor"
  defaultTheme: EditorTheme
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  valueKey: string
}

export interface PathEditorInterfaceComponentState {
  value: boolean
}
