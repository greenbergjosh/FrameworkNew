import { NavigationTabScreenProps } from "react-navigation-tabs"

export interface UserInfoProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  user: UserType | UserProfileType
}

export interface UserInfoChildProps extends UserInfoProps {
  isCurrentUser?: boolean
  onPostActionsPress?: () => void
  UserActionsButton?: () => JSX.Element
}