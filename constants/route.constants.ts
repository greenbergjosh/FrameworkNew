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

enum Promotions {
  default = "Promotions.Promotions",
  Campaign = "Promotions.Campaign",
  CampaignAdditionalImages = "Promotions.CampaignAdditionalImages",
  CampaignList = "Promotions.CampaignList",
  CampaignTemplates = "Promotions.CampaignTemplates",
  Promotions = "Promotions.Promotions",
}

enum Home {
  default = "Home.Feed",
  Feed = "Home.Feed",
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
}

enum Messages {
  default = "Messages",
  Messages = "Home.Messages",
  NewMessage = "NewMessage",
  ViewThread = "ViewThread",
}

enum Settings {
  default = "Settings.Notifications",
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
  default = "Follows.Follows",
  Follows = "Follows.Follows",
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
    route: "Analytics",
    icon: "line-chart",
  },
  {
    title: "Privacy Options",
    route: "PrivacyOptions",
    icon: "lock",
  },
  {
    title: "Notifications",
    route: "Notifications",
    icon: "bell",
  },
  {
    title: "Blocked Users",
    route: "BlockedUsers",
    icon: "stop",
  },
  {
    title: "Quick Tour",
    route: "Tour",
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
  Main,
  Messages,
  OnBoarding,
  Profile,
  Promotions,
  Settings,
  SettingsNav,
}
