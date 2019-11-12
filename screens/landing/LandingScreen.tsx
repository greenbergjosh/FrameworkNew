import React, { useContext } from "react"

import { Button } from "@ant-design/react-native"
import { HeaderLogo } from "../../components/HeaderLogo"
import { NavigationContext } from "react-navigation"

export const LandingScreen = () => {
  const { navigate } = useContext(NavigationContext)
  return (
    <>
      <Button onPress={() => navigate("Authentication")}>Login</Button>
      <Button onPress={() => navigate("OnBoarding")}>Sign Up</Button>
    </>
  )
}

LandingScreen.navigationOptions = () => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}