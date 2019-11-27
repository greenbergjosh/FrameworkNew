import React from "react"
import { Icon } from "@ant-design/react-native"
import { Colors } from "../constants/unit.constants"
import { styles } from "constants"
import { Text } from "react-native"
import { NavigationBottomTabOptions } from "react-navigation-tabs"

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
