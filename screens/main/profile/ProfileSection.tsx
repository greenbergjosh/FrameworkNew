import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { defaultNavigationOptions, routes } from "constants"
import SectionNavigator from "components/NavigationOptions"
import { ProfileScreen } from "./ProfileScreen"
import { EditProfileScreen } from "./EditProfileScreen"
import { PostDetailsScreen } from "./PostDetailsScreen"

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

export const ProfileSection = SectionNavigator(ProfileNavigator, "Profile", "user")
