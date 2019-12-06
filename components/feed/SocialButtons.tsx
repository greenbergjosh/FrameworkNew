import React from "react"
import { Flex } from "@ant-design/react-native"
import TouchIcon from "components/TouchIcon"
import { Units } from "constants"
import { SendIcon, ChatBubbleIcon } from "assets/icons"

export function SocialButtons() {
  return (
    <Flex
      justify="end"
      style={{
        marginRight: Units.margin,
        marginTop: Units.margin / 2,
        marginBottom: Units.margin / 2,
      }}>
      <TouchIcon name="question" size="md" onPress={() => alert("Send action\nFeature to come!")}>
        <SendIcon scale={0.95} />
      </TouchIcon>
      <TouchIcon
        name="share-alt"
        size="md"
        style={{ marginLeft: Units.margin / 4 }}
        onPress={() => alert("Share action\nFeature to come!")}>
        <ChatBubbleIcon scale={0.95} />
      </TouchIcon>
      <TouchIcon
        name="heart"
        size="md"
        style={{ marginLeft: Units.margin / 4 }}
        onPress={() => alert("Like action\nFeature to come!")}
      />
    </Flex>
  )
}
