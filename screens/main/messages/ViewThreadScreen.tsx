import { Flex, Icon, InputItem } from "@ant-design/react-native"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderTitle } from "components/HeaderTitle"
import { TouchIcon } from "components/TouchIcon"
import { Colors, routes, Units } from "constants"
import { GiftedChat } from "react-native-gifted-chat"
import mockMessages from "./mockMessages"

interface ViewThreadScreenProps extends NavigationStackScreenProps {}
interface ViewThreadScreenState {
  messages: {}[]
}

/**
 * About GiftedChat...
 * https://blog.jscrambler.com/build-a-chat-app-with-firebase-and-react-native/
 * https://www.npmjs.com/package/react-native-gifted-chat
 */
export class ViewThreadScreen extends React.Component<
  ViewThreadScreenProps,
  ViewThreadScreenState
> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <TouchIcon
          name="left"
          style={{ marginLeft: Units.margin - 10 }}
          iconStyle={{ color: Colors.white }}
          size="lg"
          onPress={() => navigation.navigate(routes.Messages.default)}
        />
      ),
      headerTitle: () => <HeaderTitle title="<Group Name, or Contact Name>" />,
    }
  }

  state = {
    messages: [],
  }

  componentWillMount() {
    this.setState({
      messages: mockMessages,
    })
  }

  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Flex
          direction="row"
          justify="start"
          style={{
            borderBottomWidth: 1,
            borderColor: Colors.grey,
            paddingLeft: Units.margin,
            paddingRight: Units.margin,
          }}>
          <Flex>
            <Icon name="usergroup-add" size="md" />
          </Flex>
          <Flex.Item style={{ flexGrow: 1, flexShrink: 1 }}>
            <InputItem
              type="email-address"
              placeholder="Name this Group"
              clearButtonMode="always"
            />
          </Flex.Item>
        </Flex>
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
      </>
    )
  }
}
