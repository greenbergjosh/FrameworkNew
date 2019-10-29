import { Button, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderTitle } from "../../../components/HeaderTitle"

interface ViewThreadScreenProps extends NavigationStackScreenProps {}

export class ViewThreadScreen extends React.Component<ViewThreadScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="<Group Name, or Contact Name>" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is a View Thread toast")}>
          Show View Thread Toast
        </Button>
      </>
    )
  }
}
