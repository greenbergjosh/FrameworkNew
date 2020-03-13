import React from "react"
import { Text } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { styles } from "styles"
import { Flex } from "@ant-design/react-native"

interface TourScreenProps extends NavigationSwitchScreenProps {}

export const TourScreen = (props: TourScreenProps) => {
  return (
    <Flex justify="center" align="center" direction="column" style={{ flexGrow: 1 }}>
      <Text style={styles.Body}>Tour screens to come</Text>
    </Flex>
  )
}

TourScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
