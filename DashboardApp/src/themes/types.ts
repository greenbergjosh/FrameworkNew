import { WithRouteProps } from "../state/navigation"
import { Profile } from "../state/iam/iam"
import { AppConfig } from "../state/apps"
import { UserInterfaceProps } from "@opg/interface-builder"

export interface ThemeProps {
  profile: Profile
  pagePath?: string // May be human readable snake-case URI, or GUID
  appConfig: AppConfig
  appRootPath: string
  data: UserInterfaceProps["data"]
  onChangeData: UserInterfaceProps["onChangeData"]
}

export interface ContentPanelProps {
  appConfig: AppConfig
  pagePath?: string // May be human readable snake-case URI, or GUID
  data: UserInterfaceProps["data"]
  onChangeData: UserInterfaceProps["onChangeData"]
}

export interface ITheme {
  Shell: (props: WithRouteProps<ThemeProps>) => JSX.Element
}

export interface LoginProps {
  location: {
    state?: {
      redirectedFrom?: string
    }
  }
}
