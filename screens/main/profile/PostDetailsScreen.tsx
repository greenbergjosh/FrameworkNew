import React from "react"
import { Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Flex } from "@ant-design/react-native"
import { styles } from "constants"

interface PostDetailsScreenProps extends NavigationTabScreenProps {}

export class PostDetailsScreen extends React.Component<PostDetailsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Post Details" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <Flex justify="center" align="center" direction="column" style={{ flexGrow: 1 }}>
        <Text style={styles.Body}>Post Details screen to come.</Text>
      </Flex>
    )
  }
}
