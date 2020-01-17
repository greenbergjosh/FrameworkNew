import React, { FunctionComponent } from "react"
import { TouchableOpacity, View } from "react-native"
import { Colors, routes, Units } from "constants"
import TouchText from "components/TouchText"
import { withNavigation } from "react-navigation"
import TouchIcon from "./TouchIcon"
import { ExpoIconNames } from "../@types/icon-types"

type MenuItemType = {
  key: string
  title: string
  icon: ExpoIconNames
}

const menuItems: MenuItemType[] = [
  { key: "Home", title: "Home", icon: "ios-home" },
  { key: "Explore", title: "Explore", icon: "ios-compass" },
  { key: "Promotions", title: "Promotions", icon: "shopping-bag" },
  { key: "Follows", title: "Follows", icon: "ios-heart" },
  { key: "Profile", title: "Profile", icon: "ios-person" },
]

interface TabBarItemProps {
  active: boolean
  value: MenuItemType
  navigation
}

const TabBarItem = withNavigation(({ active, value, navigation }: TabBarItemProps) => {
  function pressHandler() {
    navigation.navigate(routes[value.title].default, { transition: "fade" })
  }

  return (
    <TouchableOpacity onPress={pressHandler}>
      <TouchIcon
        name={value.icon}
        iconStyle={{ color: active ? Colors.ggNavy : Colors.navBarText }}
      />
      <TouchText
        labelStyle={{
          color: active ? Colors.ggNavy : Colors.navBarText,
          fontWeight: active ? "bold" : "normal",
          fontSize: 11,
        }}>
        {value.title}
      </TouchText>
    </TouchableOpacity>
  )
})

export interface BottomTabBarProps {
  activeTab?: string
}

export const BottomTabBar: FunctionComponent<BottomTabBarProps> = ({ activeTab }) => {
  return (
    <View
      style={{
        paddingLeft: Units.margin,
        paddingRight: Units.margin,
        paddingTop: Units.padding * 0.75,
        paddingBottom: 0,
        backgroundColor: Colors.reverse,
        borderTopWidth: 1,
        borderColor: Colors.border,
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignContent: "stretch",
        alignItems: "flex-start",
      }}>
      {menuItems.map((item) => (
        <TabBarItem
          key={item.key}
          value={item}
          active={activeTab && activeTab.split(".")[0] === item.key}
        />
      ))}
    </View>
  )
}
