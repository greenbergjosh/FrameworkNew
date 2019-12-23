export interface UserInfoProps {
  navigate
  routes: FeedRoutes
  user: UserInfoType | UserInfoFullType
}

export interface UserInfoChildProps extends UserInfoProps {
  isCurrentUser?: boolean
  onPostActionsPress?: () => void
  UserActionsButton?: () => JSX.Element
}