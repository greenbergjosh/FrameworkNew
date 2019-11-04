import { Button, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "../../../components/HeaderTitle"

interface ExploreCampaignScreenProps extends NavigationTabScreenProps {}

/** TODO: This should be a modal, not a route */
export class ExploreCampaignScreen extends React.Component<ExploreCampaignScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="DSW" offset="left" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is an ExploreCampaign toast")}>
          Show ExploreCampaign Toast
        </Button>
      </>
    )
  }
}
