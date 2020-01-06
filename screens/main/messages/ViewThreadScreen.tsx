import { Flex, Icon, InputItem } from "@ant-design/react-native"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes, Units } from "constants"
import { GiftedChat } from "react-native-gifted-chat"
import * as mockData from "api/messages-services.mockData"
import NavButton from "components/NavButton"

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
      headerLeft: (
        <NavButton
          iconName="left"
          onPress={() => navigation.navigate(routes.Messages.default)}
          position="left"
        />
      ),
      headerTitle: (
        <HeaderTitle title={mockData.message.title || `Chat - ${mockData.message.participants.join(", ")}`} />
      ),
    }
  }

  state = {
    messages: [],
  }

  componentWillMount() {
    this.setState({
      messages: mockData.message.thread,
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
            borderColor: Colors.border,
            paddingLeft: Units.margin,
            paddingRight: Units.margin,
          }}>
          <Flex>
            <Icon name="usergroup-add" size="md" />
          </Flex>
          <Flex.Item style={{ flexGrow: 1, flexShrink: 1 }}>
            <InputItem
              type="text"
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
