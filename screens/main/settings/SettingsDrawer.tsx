import {
  Button,
  Drawer,
  Icon,
  List
  } from "@ant-design/react-native"
import DrawerLayout from "@bang88/react-native-drawer-layout"
import React from "react"
import { ScrollView, Text, View } from "react-native"
import { NavigationParams, NavigationRoute } from "react-navigation"
import { NavigationStackProp } from "react-navigation-stack"
import { useAuthContext } from "../../../providers/auth-context-provider"


export interface SettingsDrawerProps {
  open: boolean
  navigation: NavigationStackProp<NavigationRoute<NavigationParams>, NavigationParams>
}

export const SettingsDrawer = (props: SettingsDrawerProps) => {
  const auth: any = useAuthContext()
  const { navigate } = props.navigation
  let drawer: DrawerLayout

  const logout = () => {
    auth.handleLogout()
    navigate("Authentication")
  }

  const renderSettingsDrawerContents = () => {
    const contents = Array.apply(null, Array(20))
      .map(function(_, i) {
        return i
      })
      .map((_i, index) => {
        if (index === 0) {
          return (
            <List.Item key={index} multipleLine>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <Text>Categories - {index}</Text>
              </View>
            </List.Item>
          )
        } else if (index === 1) {
          return (
            <List.Item key={index} multipleLine>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <Button type="primary" size="small" onPress={() => logout()}>
                  Logout
                </Button>
              </View>
            </List.Item>
          )
        }
      })

    return (
      <ScrollView style={{ flex: 1 }}>
        <List>{contents}</List>
      </ScrollView>
    )
  }

  return (
    <Drawer
      sidebar={renderSettingsDrawerContents()}
      position="left"
      open={props.open}
      drawerRef={(el) => (drawer = el)}
      drawerBackgroundColor="#ccc">
      <></>
    </Drawer>
  )
}
