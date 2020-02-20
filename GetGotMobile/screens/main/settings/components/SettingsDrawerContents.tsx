import { Flex } from "@ant-design/react-native"
import DrawerLayout from "@bang88/react-native-drawer-layout"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import { routes } from "routes"
import { Colors, Units } from "styles"
import { AuthContextType } from "data/contextProviders/auth.contextProvider"
import React from "react"
import { FlatList, View } from "react-native"
import { SettingsDrawerProps } from "../SettingsDrawer"
import SettingLink from "./SettingLink"
import { H4 } from "components/Markup"

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
        style={{
          padding: Units.margin / 2,
          paddingLeft: Units.margin,
          borderBottomWidth: 1,
          borderColor: Colors.reverse,
          marginBottom: Units.padding,
        }}>
        <Flex>
          <Avatar size="sm" source={auth.imageurl} />
          <H4 style={{ marginLeft: Units.margin / 2, color: Colors.reverse }}>{auth.handle}</H4>
        </Flex>
        <TouchIcon
          name="left"
          onPress={() => closeDrawer()}
          iconStyle={{ color: Colors.reverse }}
        />
      </Flex>
      <FlatList
        data={routes.SettingsNav}
        renderItem={({ item: { route, title, icon } }) => (
          <SettingLink
            key={route}
            title={title}
            icon={icon}
            onPress={() => {
              closeDrawer && closeDrawer()
              navigate(route)
            }}
          />
        )}
        keyExtractor={(setting) => setting.route}
      />
      <SettingLink
        key={"Settings.Logout"}
        title="Log Out"
        onPress={() => {
          closeDrawer()
          logout()
        }}
      />
    </View>
  )
}
