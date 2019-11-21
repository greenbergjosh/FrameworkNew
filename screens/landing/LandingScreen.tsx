import React from "react"
import { Text, View } from "react-native"
import { ActivityIndicator, Button, Flex, WhiteSpace } from "@ant-design/react-native"
import { routes, styles } from "constants"
import { NavigationSwitchScreenProps } from "react-navigation"
import { useAuthContext } from "../../providers/auth-context-provider"

interface LandingScreenProps extends NavigationSwitchScreenProps {}

export const LandingScreen = ({ navigation: { navigate } }: LandingScreenProps) => {
  // TODO: Does this really belong here or in App.tsx?
  const { authenticated, isAuthenticating } = useAuthContext()
  if (authenticated) {
    // Next tick. Offload from UI thread
    setTimeout(() => navigate("Main"), 0)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  } else if (isAuthenticating) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <View style={[styles.ViewContainer, { marginTop: 300 }]}>
      <Flex justify="center" direction="column">
        <Text style={[styles.H3, { marginBottom: 20 }]}>[ Large GetGot Logo ]</Text>
        <Text style={[styles.Body, { fontStyle: "italic", marginBottom: 200 }]}>Our value proposition to you!</Text>
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
      </Flex>
    </View>
  )
}
