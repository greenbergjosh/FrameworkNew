import React from "react"
import { Colors } from "./unit.constants"
import { Icon } from "@ant-design/react-native"

export const defaultNavigationOptions = {
  headerStyle: {
    color: Colors.white,
    backgroundColor: Colors.navy,
    height: 60,
  },
}

export const tabBarIcon = (name) => ({ focused, horizontal, tintColor }) => {
  return <Icon name={name} color={focused ? Colors.navy : Colors.mediumgrey} />
}