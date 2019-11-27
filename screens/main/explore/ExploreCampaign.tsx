import { Button, Flex, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Text, View } from "react-native"

interface ExploreCampaignScreenProps extends NavigationTabScreenProps {}

/** TODO: This should be a modal, not a route */
export class ExploreCampaignScreen extends React.Component<ExploreCampaignScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="DSW" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <Flex
        direction="column"
        style={{ alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
        <View>
          <Text>[ Campaign Web View ]</Text>
        </View>
      </Flex>
    )
  }
}
