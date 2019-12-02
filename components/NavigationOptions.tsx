import { Icon } from "@ant-design/react-native"
import { styles } from "constants"
import React from "react"
import { Text } from "react-native"
import { NavigationBottomTabOptions } from "react-navigation-tabs"
import { Colors } from "../constants/unit.constants"

export const TabBarIcon = ({ icon, focused }) => {
  const color = focused ? Colors.navy : Colors.mediumgrey

  return <Icon name={icon} color={color} />
}

export const TabBarLabel = ({ title, focused }) => {
  const color = focused ? Colors.navy : Colors.mediumgrey

  return <Text style={[styles.SmallCopy, { color: color }]}>{title}</Text>
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
