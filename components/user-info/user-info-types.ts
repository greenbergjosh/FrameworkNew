export interface UserInfoProps {
  navigate
  routes: FeedRoutesType
  user: UserType | UserProfileType
}

export interface UserInfoChildProps extends UserInfoProps {
  isCurrentUser?: boolean
  onPostActionsPress?: () => void
  UserActionsButton?: () => JSX.Element
}