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

export interface SettingsDrawerProps {
  open: boolean
  navigation: NavigationStackProp<NavigationRoute<NavigationParams>, NavigationParams>
}

export class SettingsDrawer extends React.Component<SettingsDrawerProps> {
  drawer: DrawerLayout

  renderSettingsDrawerContents = () => {
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
                {/* <Button type="primary" size="small" onPress={() => this.drawer.closeDrawer()}>
                  close drawer
                </Button> */}
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

  render() {
    return (
      <Drawer
        sidebar={this.renderSettingsDrawerContents()}
        position="left"
        open={this.props.open}
        drawerRef={(el) => (this.drawer = el)}
        drawerBackgroundColor="#ccc">
        <></>
      </Drawer>
    )
  }
}
