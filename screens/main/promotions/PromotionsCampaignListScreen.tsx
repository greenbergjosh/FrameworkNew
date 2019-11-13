import { Button, Icon } from "@ant-design/react-native"
import React from "react"
import { Image, Text, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "../../../components/HeaderTitle"

interface PromotionsCampaignListScreenProps extends NavigationTabScreenProps {}

export class PromotionsCampaignListScreen extends React.Component<
  PromotionsCampaignListScreenProps
> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Campaigns" offset="left" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <View style={{ height: 105, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: 120, flexDirection: "column", justifyContent: "flex-start" }}>
            <Image
              style={{ width: 90, height: 90 }}
              source={{ uri: "https://facebook.github.io/react-native/img/tiny_logo.png" }}
            />
          </View>
          <View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}>
            <Text style={{ fontSize: 17 }}>Retailer Name</Text>
            <Text style={{ color: "#707070" }}>
              Promotion Name (Can be long and should wrap when overflowing){" "}
            </Text>
            <Text style={{ color: "#707070" }}># active campaign(s)</Text>
          </View>
          <View style={{ width: 90, flexDirection: "column", justifyContent: "space-between" }}>
            <Text style={{ opacity: 0.5, fontSize: 8 }}>Promotion Expires</Text>

            <Button
              onPress={() => navigate("PromotionsCampaign", { draft: true })}
              style={{ borderWidth: 0 }}>
              <Icon name="plus" color="#007AFF" size="lg" />
            </Button>
          </View>
        </View>
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
