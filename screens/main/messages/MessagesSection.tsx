import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { MessagesScreen } from "./MessagesScreen"
import { NewMessageScreen } from "./NewMessageScreen"
import { ViewThreadScreen } from "./ViewThreadScreen"
import { defaultNavigationOptions, routes } from "constants"
import SectionNavigator from "components/NavigationOptions"

const MessagesNavigator = createStackNavigator(
  {
    [routes.Messages.Messages]: { screen: MessagesScreen },
    [routes.Messages.NewMessage]: { screen: NewMessageScreen },
    [routes.Messages.ViewThread]: { screen: ViewThreadScreen },
  },
  {
    initialRouteName: routes.Messages.default,
    defaultNavigationOptions,
  }
)

export const MessagesSection = SectionNavigator(MessagesNavigator, "Messages", "mail")
