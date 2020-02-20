import TouchIcon from "components/TouchIcon"
import { SMALL } from "components/Markup"
import React from "react"
import { NavigationBottomTabOptions } from "react-navigation-tabs"
import { Colors } from "styles"
import { ExpoIconType } from "../@types/expo-icon-type"

export const TabBarIcon = ({ icon, focused }) => {
  const color = focused ? Colors.ggNavy : Colors.navBarText

  return <TouchIcon name={icon} style={{ marginTop: 0 }} iconStyle={{ color }} />
}

export const TabBarLabel = ({ title, focused }) => {
  const color = focused ? Colors.ggNavy : Colors.navBarText

  return <SMALL style={{ color: color, textAlign: "center" }}>{title}</SMALL>
}

export const getNavigationOptions = (title, icon) => ({
  navigation,
}): NavigationBottomTabOptions => ({
  tabBarIcon: ({ focused }) => TabBarIcon({ icon, focused }),
  tabBarLabel: ({ focused }) => TabBarLabel({ title, focused }),
})

const TabBarSectionNavigator = (Navigator, title, icon: ExpoIconType) => {
  const nav = ({ navigation }) => <Navigator navigation={navigation} />
  nav.router = Navigator.router
  nav.navigationOptions = getNavigationOptions(title, icon)
  return nav
}

export default TabBarSectionNavigator
