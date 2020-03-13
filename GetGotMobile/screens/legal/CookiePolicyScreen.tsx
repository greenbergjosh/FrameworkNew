import React, { useContext } from "react"
import { Text, View } from "react-native"
import { Flex, Icon } from "@ant-design/react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { H2, P } from "components/Markup"
import { NavigationContext } from "react-navigation"
import { styles, Units } from "styles"

export const CookiePolicyScreen = () => {
  const { navigate } = useContext(NavigationContext)
  return (
    <View style={styles.ViewContainer}>
      <Flex direction="row" justify="center">
        <Icon name="info-circle" size="lg" style={{ marginRight: Units.padding }} />
        <H2>Cookie Policy</H2>
      </Flex>
      <View style={styles.ViewContainer}>
        <P>Copy to come.</P>
      </View>
    </View>
  )
}

CookiePolicyScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
