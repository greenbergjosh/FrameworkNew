import { Icon } from "@ant-design/react-native"
import React from "react"
import { NavigationBottomTabOptions } from "react-navigation-tabs"
import { Colors } from "../constants/unit.constants"
import { SMALL } from "components/Markup"

export const TabBarIcon = ({ icon, focused }) => {
  const color = focused ? Colors.navy : Colors.greyMediumLight

  return <Icon name={icon} color={color} />
}

export const TabBarLabel = ({ title, focused }) => {
  const color = focused ? Colors.navy : Colors.greyMediumLight

  return <SMALL style={{ color: color }}>{title}</SMALL>
}

export const getNavigationOptions = (title, icon) => ({
  navigation,
}): NavigationBottomTabOptions => ({
  tabBarIcon: ({ focused }) => TabBarIcon({ icon, focused }),
  tabBarLabel: ({ focused }) => TabBarLabel({ title, focused }),
})

const TabBarSectionNavigator = (Navigator, title, icon) => {
  const nav = ({ navigation }) => <Navigator navigation={navigation} />
  nav.router = Navigator.router
  nav.navigationOptions = getNavigationOptions(title, icon)
  return nav
}

export default TabBarSectionNavigator
