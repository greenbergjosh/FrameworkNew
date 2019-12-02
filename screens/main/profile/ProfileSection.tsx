import TabBarSectionNavigator from "components/NavigationOptions"
import { defaultNavigationOptions, routes } from "constants"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { EditProfileScreen } from "./EditProfileScreen"
import { PostDetailsScreen } from "./PostDetailsScreen"
import { ProfileScreen } from "./ProfileScreen"

const ProfileNavigator = createStackNavigator(
  {
    [routes.Profile.Profile]: { screen: ProfileScreen },
    [routes.Profile.EditProfile]: { screen: EditProfileScreen },
    [routes.Profile.PostDetails]: { screen: PostDetailsScreen },
  },
  {
    initialRouteName: routes.Profile.default,
    defaultNavigationOptions,
  }
)

export const ProfileSection = TabBarSectionNavigator(ProfileNavigator, "Profile", "user")
