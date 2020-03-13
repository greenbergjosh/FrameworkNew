import React from "react"
import { Icon } from "@ant-design/react-native"
import { IconProps } from "@ant-design/react-native/lib/icon"
import { Text, TouchableOpacity } from "react-native"
import { Colors, Units } from "styles"
import { ListItemProps } from "@ant-design/react-native/es/list/ListItem"

interface DrawerItemProps extends ListItemProps {
  title: string
  icon?: IconProps["name"]
  onPress?: () => void
}

export default function SettingLink({ title, icon, onPress }: DrawerItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        display: "flex",
        flexDirection: "row",
        paddingLeft: Units.margin,
        paddingRight: Units.margin,
        paddingTop: Units.padding,
        paddingBottom: Units.padding,
      }}>
      {!icon ? null : <Icon style={{ marginRight: Units.padding }} name={icon} />}
      <Text style={{ color: Colors.reverse }}>{title}</Text>
    </TouchableOpacity>
  )
}
