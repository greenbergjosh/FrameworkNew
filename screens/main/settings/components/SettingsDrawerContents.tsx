import { Flex, List } from "@ant-design/react-native"
import DrawerLayout from "@bang88/react-native-drawer-layout"
import React from "react"
import { Text, View } from "react-native"
import { AuthContextType } from "providers/auth-context-provider"
import { Colors, routes, styles, Units } from "constants"
import { Avatar } from "components/Avatar"
import SettingLink from "./SettingLink"
import { TouchIcon } from "components/TouchIcon"
import { SettingsDrawerProps } from "../SettingsDrawer"

export interface SettingsDrawerContentsProps {
  auth: AuthContextType
  navigate: SettingsDrawerProps["navigation"]["navigate"]
  closeDrawer: DrawerLayout["closeDrawer"]
  logout: () => void
}

export default function SettingsDrawerContents({
  auth,
  navigate,
  closeDrawer,
  logout,
}: SettingsDrawerContentsProps) {
  return (
    <View style={{ marginTop: Units.margin * 2 }}>
      <Flex
        direction="row"
        justify="between"
        style={{ margin: Units.margin / 2, marginLeft: Units.margin }}>
        <Flex>
          <Avatar size="sm" />
          <Text style={[styles.H4, { marginLeft: Units.margin / 2, color: Colors.white }]}>
            sarah.p
          </Text>
        </Flex>
        <TouchIcon name="left" onPress={() => closeDrawer()} iconStyle={{ color: Colors.white }} />
      </Flex>
      <List>
        <>
          {routes.SettingsNav.map(({ title, icon, route }) => (
            <SettingLink
              key={route}
              title={title}
              icon={icon}
              onPress={() => {
                closeDrawer()
                navigate(route)
              }}
            />
          ))}
          <SettingLink
            key={"Settings.Logout"}
            title="Log Out"
            onPress={() => {
              closeDrawer()
              logout()
            }}
          />
        </>
      </List>
    </View>
  )
}
