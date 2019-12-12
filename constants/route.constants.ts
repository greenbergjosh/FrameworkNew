import { IconProps } from "@ant-design/react-native/lib/icon"

export interface NavigationItem {
  title: string
  route: string
  icon?: IconProps["name"]
}

enum Authentication {
  default = "Authentication.Login",
  Banned = "Authentication.Banned",
  Login = "Authentication.Login",
  ResetPassword = "Authentication.ResetPassword",
}

enum Legal {
  default = "Legal.TermsOfService",
  TermsOfService = "Legal.TermsOfService",
  PrivacyPolicy = "Legal.PrivacyPolicy",
  CookiePolicy = "Legal.CookiePolicy",
  UserAgreement = "Legal.UserAgreement",
}

enum Promotions {
  default = "Promotions.Promotions",
  Campaign = "Promotions.Campaign",
  CampaignAdditionalImages = "Promotions.CampaignAdditionalImages",
  CampaignList = "Promotions.CampaignList",
  CampaignTemplates = "Promotions.CampaignTemplates",
  Promotions = "Promotions.Promotions",
  PromotionsArchived = "Promotions.PromotionsArchived",
}

enum Home {
  default = "Home.Feed",
  Feed = "Home.Feed",
  Messages = "Home.Messages",
  Settings = "Home.Settings",
}

enum OnBoarding {
  default = "OnBoarding.CreateAccount",
  CodeEntry = "OnBoarding.CodeEntry",
  CreateAccount = "OnBoarding.CreateAccount",
  ResendCode = "OnBoarding.ResendCode",
  SelectInterests = "OnBoarding.SelectInterests",
  SetPassword = "OnBoarding.SetPassword",
  SyncContacts = "OnBoarding.SyncContacts",
  Tour = "OnBoarding.Tour",
}

enum Explore {
  default = "Explore.Feed",
  Campaign = "Explore.Campaign",
  Feed = "Explore.Feed",
  FeedDetails = "Explore.FeedDetails",
  UserFeed = "Explore.UserFeed",
  UserFeedDetails = "Explore.UserFeedDetails",
  UserFollows = "Explore.UserFollows",
  UserFollowsMutual = "Explore.UserFollows.Mutual",
  UserFollowsFollowers = "Explore.UserFollows.Followers",
  UserFollowsInfluencers = "Explore.UserFollows.Influencers",
}

enum Messages {
  default = "Messages.Messages",
  Messages = "Messages.Messages",
  NewMessage = "Messages.NewMessage",
  ViewThread = "Messages.ViewThread",
}

enum Settings {
  default = "Settings.Analytics",
  Analytics = "Settings.Analytics",
  BlockedUsers = "Settings.BlockedUsers",
  Notifications = "Settings.Notifications",
  PrivacyOptions = "Settings.PrivacyOptions",
}

enum Profile {
  default = "Profile.Profile",
  Profile = "Profile.Profile",
  EditProfile = "Profile.EditProfile",
  PostDetails = "Profile.PostDetails",
}

enum Follows {
  default = "Follows",
  Followers = "Follows.Followers",
  Influencers = "Follows.Influencers",
}

enum Landing {
  default = "Landing.Landing",
  Landing = "Landing.Landing",
}

enum Main {
  default = "Main.Home",
  Home = "Main.Home",
  Explore = "Main.Explore",
  Promotions = "Main.Promotions",
  Follows = "Main.Follows",
  Profile = "Main.Profile",
}

const SettingsNav: NavigationItem[] = [
  {
    title: "Analytics",
    route: Settings.Analytics,
    icon: "line-chart",
  },
  {
    title: "Privacy Options",
    route: Settings.PrivacyOptions,
    icon: "lock",
  },
  {
    title: "Notifications",
    route: Settings.Notifications,
    icon: "bell",
  },
  {
    title: "Blocked Users",
    route: Settings.BlockedUsers,
    icon: "stop",
  },
  {
    title: "Quick Tour",
    route: OnBoarding.Tour,
    icon: "compass",
  },
]

const DevMenu = "DevMenu"

export const routes = {
  Authentication,
  DevMenu,
  Explore,
  Follows,
  Home,
  Landing,
  Legal,
  Main,
  Messages,
  OnBoarding,
  Profile,
  Promotions,
  Settings,
  SettingsNav,
}
