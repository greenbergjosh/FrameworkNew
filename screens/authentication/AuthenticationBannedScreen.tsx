import React, { useContext } from "react"
import { Button } from "@ant-design/react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { routes } from "constants"

export const AuthenticationBannedScreen = () => {
  const {navigate} = useContext(NavigationContext);
  return (
    <>
      <Button onPress={() => navigate(routes.Landing)}>Sign Out</Button>
    </>
  )
}

AuthenticationBannedScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
