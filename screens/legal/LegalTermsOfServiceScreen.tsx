import React, { useContext } from "react"
import { Text, View } from "react-native"
import { Button, Flex, Icon } from "@ant-design/react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { H2, P } from "components/Markup"
import { NavigationContext } from "react-navigation"
import { styles, Units } from "constants"

export const LegalTermsOfServiceScreen = () => {
  const { navigate } = useContext(NavigationContext)
  return (
    <View style={styles.ViewContainer}>
      <Flex direction="row" justify="center">
        <Icon name="info-circle" size="lg" style={{ marginRight: Units.padding }} />
        <H2>Terms of Service</H2>
      </Flex>
      <View style={styles.ViewContainer}>
        <P>Copy to come.</P>
      </View>
    </View>
  )
}

LegalTermsOfServiceScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
