import { AuthContextType, useAuthContext } from "../../../providers/auth-context-provider"
import {
  Button,
  Drawer,
  Icon,
  List,
  WhiteSpace
} from "@ant-design/react-native"
import { NavigationParams, NavigationRoute, NavigationSwitchProp } from "react-navigation"
import { ScrollView, Text, View } from "react-native"

import DrawerLayout from "@bang88/react-native-drawer-layout"
import { IconProps } from "@ant-design/react-native/lib/icon"
import React from "react"

interface NavigationItem {
  title: string
  route: string
  icon?: IconProps["name"]
}

export const SettingsDrawerContext = React.createContext({
  open: false,
  toggle: (state?: boolean) => {},
})

export interface SettingsDrawerChildProps {
  open?: () => void
  close?: () => void
}

export interface SettingsDrawerProps extends React.PropsWithChildren<unknown> {
  open: boolean
  navigation: NavigationSwitchProp<NavigationRoute<NavigationParams>, NavigationParams>
}

export const SettingsDrawer = (props: SettingsDrawerProps) => {
  const auth = useAuthContext()
  const { navigate } = props.navigation
  const drawerRef = React.useRef<DrawerLayout>(null)

  const logout = () => {
    auth.handleLogout()
    navigate("Authentication")
  }

  return (
    <SettingsDrawerContext.Consumer>
      {({ open, toggle }) => (
        <Drawer
          sidebar={renderSettingsDrawerContents(
            auth,
            navigate,
            drawerRef && drawerRef.current && drawerRef.current.closeDrawer,
            logout
          )}
          position="left"
          open={props.open || open}
          drawerRef={(ref) => (drawerRef.current = ref)}
          drawerBackgroundColor="#343997"
          onOpenChange={(value) => toggle(value)}>
          {props.children}
        </Drawer>
      )}
    </SettingsDrawerContext.Consumer>
  )
}

const settingsRoutes: NavigationItem[] = [
  {
    title: "Analytics",
    route: "Analytics",
    icon: "line-chart",
  },
  {
    title: "Privacy Options",
    route: "PrivacyOptions",
    icon: "lock",
  },
  {
    title: "Notifications",
    route: "Notifications",
    icon: "bell",
  },
  {
    title: "Blocked Users",
    route: "BlockedUsers",
    icon: "stop",
  },
  {
    title: "Quick Tour",
    route: "Tour",
  },
]

const renderSettingsDrawerContents = (
  auth: AuthContextType,
  navigate: SettingsDrawerProps["navigation"]["navigate"],
  closeDrawer: DrawerLayout["closeDrawer"],
  logout: () => void
) => {
  return (
    <>
      <ScrollView style={{ flex: 1 }}>
        <WhiteSpace />
        <List>
          <List.Item thumb={auth.imageurl} style={{ backgroundColor: "#343997" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Text style={{ color: "#fff" }}>{auth.handle}</Text>
              <Button
                size="small"
                style={{ backgroundColor: "#343997", borderWidth: 0 }}
                onPress={() => closeDrawer()}>
                <Icon name="left" color="#fff" />
              </Button>
            </View>
          </List.Item>
          <>{settingsRoutes.map((item) => renderDrawerItem(item, navigate, closeDrawer))}</>
          <List.Item
            multipleLine
            style={{ backgroundColor: "#343997", borderWidth: 0 }}
            onPress={() => {
              closeDrawer()
              logout()
            }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderWidth: 0,
                borderBottomColor: "red",
                borderTopColor: "green",
              }}>
              <Text style={{ color: "#fff" }}>Log out</Text>
            </View>
          </List.Item>
        </List>
      </ScrollView>
    </>
  )
}

const renderDrawerItem = (
  {
    title,
    route,
    icon,
  }: {
    title: string
    route: string
    icon?: IconProps["name"]
  },
  navigate,
  closeDrawer
) => {
  return (
    <List.Item
      key={title}
      multipleLine
      style={{ backgroundColor: "#343997", borderWidth: 0 }}
      thumb={icon && <Icon name={icon} />}
      onPress={() => {
        navigate(route)
        closeDrawer()
      }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderWidth: 0,
          borderBottomColor: "red",
          borderTopColor: "green",
        }}>
        <Text style={{ color: "#fff" }}>{title}</Text>
      </View>
    </List.Item>
  )
}
