import { FlatList, Text, View, TouchableOpacity, TextInput } from "react-native"
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Flex,
  Modal,
  SearchBar,
  WhiteSpace,
} from "@ant-design/react-native"
import { Colors, ImageUris, styles, Units } from "constants"
import TouchIcon from "components/TouchIcon"
import { UserRow } from "components/UserRow"
import React from "react"
import { Empty } from "components/Empty"
import { useFollowsContext } from "providers/follows-context-provider"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import Avatar from "components/Avatar"

interface PostToFeedProps {
  onClose: () => void
}

export const PostToFeed = ({ onClose }: PostToFeedProps) => {
  const [message, setMessage] = React.useState(null)

  return (
    <>
      <TextInput
        placeholder="Enter your message"
        style={{
          height: Units.minTouchArea,
          borderColor: Colors.border,
          borderWidth: 1,
          padding: Units.padding,
        }}
        onChangeText={(text) => setMessage(text)}
        value={message}
      />
      <WhiteSpace size="xl" />
      <Button
        type="primary"
        onPress={() => {
          // TODO: api call to send post
          onClose()
        }}>
        Post
      </Button>
      <WhiteSpace size="xl" />
    </>
  )
}
