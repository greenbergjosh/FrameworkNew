import { WithRouteProps } from "../state/navigation"
import { Profile } from "../state/iam/iam"
import { AppConfig } from "../state/apps"

export interface ThemeProps {
  profile: Profile
  pagePath?: string // May be human readable snake-case URI, or GUID
  appConfig: AppConfig
  appRootPath: string
}

export interface ContentPanelProps {
  appConfig: AppConfig
  pagePath?: string // May be human readable snake-case URI, or GUID
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
