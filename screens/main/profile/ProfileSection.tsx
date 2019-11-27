import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { defaultNavigationOptions, routes } from "constants"
import SectionNavigator from "components/NavigationOptions"
import { ProfileScreen } from "./ProfileScreen"

const ProfileNavigator = createStackNavigator(
  {
    Profile: { screen: ProfileScreen },
  },
  {
    initialRouteName: routes.Profile,
    defaultNavigationOptions,
  }
)

export const ProfileSection = SectionNavigator(ProfileNavigator, "Profile", "user")
