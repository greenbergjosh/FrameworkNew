import React, { useContext } from "react"
import { Text, View } from "react-native"
import { Flex, Icon } from "@ant-design/react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { styles, Units } from "constants"

export const LegalCookiePolicyScreen = () => {
  const { navigate } = useContext(NavigationContext)
  return (
    <View style={styles.ViewContainer}>
      <Flex direction="row" justify="center">
        <Icon name="info-circle" size="lg" style={{ marginRight: Units.padding }} />
        <Text style={styles.H2}>Cookie Policy</Text>
      </Flex>
      <View style={styles.ViewContainer}>
        <Text>Copy to come.</Text>
      </View>
    </View>
  )
}

LegalCookiePolicyScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
