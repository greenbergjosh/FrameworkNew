import React from "react"
import { Flex } from "@ant-design/react-native"
import TouchIcon from "components/TouchIcon"
import { Units } from "constants"

interface SocialButtonsProps {
  liked?: boolean
}

export function SocialButtons({ liked }: SocialButtonsProps) {
  return (
    <Flex
      justify="end"
      align="center"
      style={{
        marginRight: Units.margin,
        marginTop: Units.margin / 2,
        marginBottom: Units.margin / 2,
      }}>
      <TouchIcon name="ios-open" size="md" onPress={() => alert("Send action\nFeature to come!")} />
      <TouchIcon
        name="ios-chatbubbles"
        size="md"
        style={{ marginLeft: Units.margin / 4 }}
        onPress={() => alert("Share action\nFeature to come!")}
      />
      <TouchIcon
        toggledNames={{ on: "heart", off: "hearto" }}
        size="md"
        style={{ marginLeft: Units.margin / 4 }}
        onPress={() => alert("Like action\nFeature to come!")}
        active={liked}
      />
    </Flex>
  )
}
