import React from "react"
import { Flex, Icon, List } from "@ant-design/react-native"
import { IconProps } from "@ant-design/react-native/lib/icon"
import { Text, View } from "react-native"
import { Colors, Units } from "constants"
import { ListItemProps } from "@ant-design/react-native/es/list/ListItem"

interface DrawerItemProps extends ListItemProps {
  title: string
  icon?: IconProps["name"]
}

export default function SettingLink({ title, icon, onPress }: DrawerItemProps) {
  return (
    <List.Item key={title} style={{ backgroundColor: Colors.ggNavy }} onPress={onPress}>
      <Flex>
        {!icon ? null : <Icon style={{ marginRight: Units.margin }} name={icon} />}
        <Text style={{ color: Colors.reverse }}>{title}</Text>
      </Flex>
    </List.Item>
  )
}
