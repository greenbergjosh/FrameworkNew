import { ActivityIndicator, Button, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"
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
    <>
      <WhiteSpace />
      <HeaderLogo />
      <Button onPress={() => navigate("OnBoarding")}>Create New Account</Button>
      <Button onPress={() => navigate("Authentication")}>Login</Button>
    </>
  )
}
