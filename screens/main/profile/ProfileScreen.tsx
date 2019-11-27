import React from "react"
import { Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Flex } from "@ant-design/react-native"
import { styles } from "constants"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export class ProfileScreen extends React.Component<ProfileScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Profile" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <Flex justify="center" align="center" direction="column" style={{ flexGrow: 1 }}>
        <Text style={styles.Body}>Profile screen to come.</Text>
      </Flex>
    )
  }
}
