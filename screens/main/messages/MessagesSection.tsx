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
    headerLeft: null,
    headerStyle: { height: 0 },
    // headerTitle: () => <HeaderLogo />,
    // headerRight: () => (
    //   <Button
    //     onPress={() => navigation.navigate(routes.Home.Messages)}
    //     style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
    //     <Icon name="mail" color="#fff" size="md" />
    //   </Button>
    // ),
  }
}
