import { Button, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "../../../components/HeaderTitle"

interface PromotionsScreenProps extends NavigationTabScreenProps {}

export class PromotionsScreen extends React.Component<PromotionsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Promotions" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is a Promotions toast")}>
          Show Promotions Toast
        </Button>
        <Button onPress={() => navigate("PromotionsCampaignList")}>Jump to Single Promotion</Button>
        <Button onPress={() => navigate("PromotionsCampaign", { draft: true })}>
          Jump to Single Campaign (Draft)
        </Button>
        <Button onPress={() => navigate("PromotionsCampaign")}>
          Jump to Single Campaign (Published)
        </Button>
      </>
    )
  }
}
