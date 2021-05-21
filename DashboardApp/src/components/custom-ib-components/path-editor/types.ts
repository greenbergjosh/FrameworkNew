import {
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  EditorTheme,
  UserInterfaceProps,
} from "@opg/interface-builder"

export interface PathEditorInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "path-editor"
  defaultTheme: EditorTheme
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  valueKey: string
}

export interface PathEditorInterfaceComponentState {
  value: boolean
}
