import { Button, Icon } from "@ant-design/react-native"
import { HeaderLogo } from "components/HeaderLogo"
import TabBarSectionNavigator from "components/NavigationOptions"
import { Colors, defaultNavigationOptions, routes } from "constants"
import React from "react"
import { NavigationContext } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
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
    //     onPress={() => navigation.navigate(routes.Main.Messages)}
    //     style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
    //     <Icon name="mail" color="#fff" size="md" />
    //   </Button>
    // ),
  }
}
