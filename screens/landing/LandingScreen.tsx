import {
  ActivityIndicator,
  Button,
  Flex,
  WhiteSpace
  } from "@ant-design/react-native"
import { routes, styles } from "constants"
import { useAuthContext } from "providers/auth-context-provider"
import React from "react"
import { Text, View } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"

interface LandingScreenProps extends NavigationSwitchScreenProps {}

export const LandingScreen = ({ navigation: { navigate } }: LandingScreenProps) => {
  navigate(routes.DevMenu)
  // TODO: Does this really belong here or in App.tsx?
  const { authenticated, isAuthenticating } = useAuthContext()
  if (authenticated) {
    // Next tick. Offload from UI thread
    setTimeout(() => navigate(routes.Main.default), 0)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  } else if (isAuthenticating) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <View style={[styles.ViewContainer, { flex: 1 }]}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={[styles.H3, { marginBottom: 20 }]}>[ Large GetGot Logo ]</Text>
        <Text style={[styles.Body, { fontStyle: "italic" }]}>Our value proposition to you!</Text>
      </View>
      <View style={{ height: 150 }}>
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={() => navigate(routes.OnBoarding.default)}>
          Create New Account
        </Button>
        <WhiteSpace size="xl" />
        <WhiteSpace size="xl" />
        <Button
          type="ghost"
          size="large"
          style={styles.LinkButton}
          onPress={() => navigate(routes.Authentication.default)}>
          Log In
        </Button>
      </View>
    </View>
  )
}
