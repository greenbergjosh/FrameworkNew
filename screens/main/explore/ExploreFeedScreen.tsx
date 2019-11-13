import { Button, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "../../../components/HeaderTitle"

interface ExploreFeedScreenProps extends NavigationTabScreenProps {}

export class ExploreFeedScreen extends React.Component<ExploreFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Explore" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is an ExploreFeed toast")}>
          Show ExploreFeed Toast
        </Button>
        <Button onPress={() => navigate("ExploreUserFeed")}>Jump to User</Button>
        <Button onPress={() => navigate("ExploreCampaign")}>Jump to Campaign</Button>
      </>
    )
  }
}
