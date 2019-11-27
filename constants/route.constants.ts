enum Authentication {
  default = "AuthenticationLogin",
  AuthenticationBanned = "AuthenticationBanned",
  AuthenticationLogin = "AuthenticationLogin",
  AuthenticationResetPassword = "AuthenticationResetPassword",
}

enum Home {
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

enum OnBoarding {
  default = "OnBoardingCreateAccount",
  CodeEntry = "OnBoardingCodeEntry",
  CreateAccount = "OnBoardingCreateAccount",
  ResendCode = "OnBoardingResendCode",
  SelectInterests = "OnBoardingSelectInterests",
  SetPassword = "OnBoardingSetPassword",
  SyncContacts = "OnBoardingSyncContacts",
}

enum Explore {
  Feed = "Explore.Feed",
  FeedDetails = "Explore.FeedDetails",
  UserFeed = "Explore.UserFeed",
  UserFeedDetails = "Explore.UserFeedDetails",
  Campaign = "Explore.Campaign",
}
const Follows = "Follows"

export const routes = {
  Authentication,
  Explore,
  Follows,
  Home,
  OnBoarding,
}
