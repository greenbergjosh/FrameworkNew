import React from "react"
import { Text } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { styles } from "constants"
import { Flex } from "@ant-design/react-native"

interface OnBoardingTourScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingTourScreen = (props: OnBoardingTourScreenProps) => {
  return (
    <Flex justify="center" align="center" direction="column" style={{ flexGrow: 1 }}>
      <Text style={styles.Body}>Tour screens to come</Text>
    </Flex>
  )
}

OnBoardingTourScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
