import { Button, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "../../../components/HeaderTitle"

interface ExploreUserFeedScreenProps extends NavigationTabScreenProps {}

export class ExploreUserFeedScreen extends React.Component<ExploreUserFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Explore" offset="left" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is an ExploreUserFeed toast")}>
          Show ExploreUserFeed Toast
        </Button>
      </>
    )
  }
}
