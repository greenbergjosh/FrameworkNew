import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { defaultNavigationOptions, routes } from "constants"
import { MessagesScreen } from "./MessagesScreen"
import { NewMessageScreen } from "./NewMessageScreen"
import { ViewThreadScreen } from "./ViewThreadScreen"

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

export const MessagesSection = MessagesNavigator

MessagesSection.router = MessagesNavigator.router
MessagesSection.navigationOptions = ({ navigation }) => {
  return {
    // TODO: There appears to be a double layer header with this section and its children. This is a quick fix to hide it, but probably needs more thought
    headerLeft: null,
    headerStyle: { height: 0 },
  }
}
