import {
    Button,
    Drawer,
    List
} from "@ant-design/react-native"
import React, { useContext } from "react"
import { ScrollView, Text, View } from "react-native"

import { AuthContext } from "../../../providers/auth-context-provider"
import DrawerLayout from "@bang88/react-native-drawer-layout"
import { NavigationContext } from "react-navigation"

export interface SettingsDrawerProps {
  open: boolean
}

export const SettingsDrawer = (props: SettingsDrawerProps) => {
  const auth: any = useContext(AuthContext)
  const {navigate} = useContext(NavigationContext);
  let drawer: DrawerLayout

  const logout = () => {
    auth.handleLogout()
    navigate("Authentication")
  }

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
              <Button type="primary" size="small" onPress={() => logout()}>
                Logout
              </Button>
            </List.Item>
          )
        }
      })

  const renderSettingsDrawerContents = () => {
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

