import { Drawer } from "@ant-design/react-native"
import DrawerLayout from "@bang88/react-native-drawer-layout"
import { useGetGotRootDataContext } from "data/getgotRootData.contextProvider"
import React from "react"
import { NavigationParams, NavigationRoute, NavigationSwitchProp } from "react-navigation"
import { useAuthContext } from "data/auth.contextProvider"
import { Colors, routes } from "constants"
import SettingsDrawerContents from "./components/SettingsDrawerContents"

export const SettingsDrawerContext = React.createContext({
  open: false,
  toggle: (state?: boolean) => {},
})

export interface SettingsDrawerProps extends React.PropsWithChildren<unknown> {
  open: boolean
  navigation: NavigationSwitchProp<NavigationRoute<NavigationParams>, NavigationParams>
}

export const SettingsDrawer = (props: SettingsDrawerProps) => {
  const auth = useAuthContext()
  const rootDataContext = useGetGotRootDataContext()
  const { navigate } = props.navigation
  const drawerRef = React.useRef<DrawerLayout>(null)

  const logout = () => {
    auth.handleLogout()
    rootDataContext.reset()
    navigate(routes.Authentication.default)
  }

  return (
    <SettingsDrawerContext.Consumer>
      {({ open, toggle }) => (
        <Drawer
          sidebar={
            <SettingsDrawerContents
              auth={auth}
              navigate={navigate}
              closeDrawer={() => drawerRef && drawerRef.current.closeDrawer()}
              logout={logout}
            />
          }
          position="left"
          open={props.open || open}
          drawerRef={(ref) => (drawerRef.current = ref)}
          drawerBackgroundColor={Colors.ggNavy}
          onOpenChange={(value) => toggle(value)}>
          {props.children}
        </Drawer>
      )}
    </SettingsDrawerContext.Consumer>
  )
}
