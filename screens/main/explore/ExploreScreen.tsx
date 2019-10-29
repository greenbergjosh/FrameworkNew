import { Button, Icon, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"

interface ExploreScreenProps extends NavigationTabScreenProps {}

export class ExploreScreen extends React.Component<ExploreScreenProps> {
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return <Icon name="search" color={focused ? "#343977" : "#999999"} />
      },
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is an Explore toast")}>Show Explore Toast</Button>
      </>
    )
  }
}
