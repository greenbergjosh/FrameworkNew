export interface UserInfoProps {
  navigate
  routes: FeedRoutes
  user: UserType | UserProfileType
}

export interface UserInfoChildProps extends UserInfoProps {
  isCurrentUser?: boolean
  onPostActionsPress?: () => void
  UserActionsButton?: () => JSX.Element
}