export enum Authentication {
  default = "AuthenticationLogin",
  AuthenticationBanned = "AuthenticationBanned",
  AuthenticationLogin = "AuthenticationLogin",
  AuthenticationResetPassword = "AuthenticationResetPassword",
}
export enum Home {
  default = "HomeFeed",
  Analytics = "Analytics",
  BlockedUsers = "BlockedUsers",
  HomeFeed = "HomeFeed",
  Messages = "Messages",
  NewMessage = "NewMessage",
  Notifications = "Notifications",
  PrivacyOptions = "PrivacyOptions",
  Tour = "Tour",
  ViewThread = "ViewThread",
}
export enum OnBoarding {
  default = "OnBoardingCreateAccount",
  CodeEntry = "OnBoardingCodeEntry",
  CreateAccount = "OnBoardingCreateAccount",
  ResendCode = "OnBoardingResendCode",
  SelectInterests = "OnBoardingSelectInterests",
  SetPassword = "OnBoardingSetPassword",
  SyncContacts = "OnBoardingSyncContacts",
}
export enum Follows {
  Following = "FollowsFollowing",
  Follows = "FollowsFollows",
}

export const routes = {
  Authentication,
  Follows,
  Home,
  OnBoarding,
}
