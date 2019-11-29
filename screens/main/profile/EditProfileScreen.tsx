import React from "react"
import { Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Flex } from "@ant-design/react-native"
import { styles } from "constants"

interface EditProfileScreenProps extends NavigationTabScreenProps {}

export class EditProfileScreen extends React.Component<EditProfileScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Edit Profile" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <Flex justify="center" align="center" direction="column" style={{ flexGrow: 1 }}>
        <Text style={styles.Body}>Edit Profile screen to come.</Text>
      </Flex>
    )
  }
}
