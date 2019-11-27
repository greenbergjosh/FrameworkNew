import { IconProps } from "@ant-design/react-native/lib/icon"

interface NavigationItem {
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
  Campaign = "Promotions.Campaign",
  CampaignAdditionalImages = "Promotions.CampaignAdditionalImages",
  CampaignList = "Promotions.CampaignList",
  CampaignTemplates = "Promotions.CampaignTemplates",
  Promotions = "Promotions.Promotions",
}

enum Home {
  default = "Home.Feed",
  Analytics = "Home.Analytics",
  BlockedUsers = "Home.BlockedUsers",
  Feed = "Home.Feed",
  Messages = "Home.Messages",
  NewMessage = "Home.NewMessage",
  Notifications = "Home.Notifications",
  PrivacyOptions = "Home.PrivacyOptions",
  Tour = "Home.Tour",
  ViewThread = "Home.ViewThread",
}

enum OnBoarding {
  default = "OnBoarding.CreateAccount",
  CodeEntry = "OnBoarding.CodeEntry",
  CreateAccount = "OnBoarding.CreateAccount",
  ResendCode = "OnBoarding.ResendCode",
  SelectInterests = "OnBoarding.SelectInterests",
  SetPassword = "OnBoarding.SetPassword",
  SyncContacts = "OnBoarding.SyncContacts",
}

enum Explore {
  Campaign = "Explore.Campaign",
  Feed = "Explore.Feed",
  FeedDetails = "Explore.FeedDetails",
  UserFeed = "Explore.UserFeed",
  UserFeedDetails = "Explore.UserFeedDetails",
}

enum Messages {
  default = "Messages",
  NewMessage = "NewMessage",
  ViewThread = "ViewThread",
}

const Settings: NavigationItem[] = [
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
const Follows = "Follows"
const Landing = "Landing"
const Main = "Main"
const Profile = "Profile"

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
}
