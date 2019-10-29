import { Button, Icon, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"

interface PromotionsScreenProps extends NavigationTabScreenProps {}

export class PromotionsScreen extends React.Component<PromotionsScreenProps> {
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return <Icon name="shopping" color={focused ? "#343977" : "#999999"} />
      },
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is an Promotions toast")}>
          Show Promotions Toast
        </Button>
      </>
    )
  }
}
