export enum Authentication {
  AuthenticationBanned = "AuthenticationBanned",
  AuthenticationLogin = "AuthenticationLogin",
}
export enum Home {
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
