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
  ResendCode = "OnBoardingResendCode",
  SelectInterests = "OnBoardingSelectInterests",
  SetPassword = "OnBoardingSetPassword",
  CreateAccount = "OnBoardingCreateAccount",
  SyncContacts = "OnBoardingSyncContacts",
}

export const routes = {
  Authentication,
  Home,
  OnBoarding,
}
