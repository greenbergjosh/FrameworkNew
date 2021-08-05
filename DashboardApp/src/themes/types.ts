import { AppConfig } from "../state/apps"
import { UserInterfaceProps } from "@opg/interface-builder"
import { RouteComponentProps } from "@reach/router"

export interface ThemeLoaderProps {
  path: string
}

export interface ThemeProps {
  appUri?: string
  pagePath?: string // May be human readable snake-case URI, or GUID
  appConfig: AppConfig
  appRootPath: string
  data: UserInterfaceProps["data"]
  onChangeData: UserInterfaceProps["onChangeData"]
}

export interface ContentPanelProps {
  appConfig: AppConfig
  appUri?: string
  pagePath?: string // May be human readable snake-case URI, or GUID
  data: UserInterfaceProps["data"]
  onChangeData: UserInterfaceProps["onChangeData"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
}

export interface ITheme {
  Shell: (props: RouteComponentProps<ThemeProps>) => JSX.Element | null
}

export interface LoginProps {
  location: {
    state?: {
      redirectedFrom?: string
    }
  }
}
