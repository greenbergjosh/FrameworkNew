import React from "react"
import { Flex } from "@ant-design/react-native"
import TouchIcon from "components/TouchIcon"
import { Units, Colors } from "constants"
import { SMALL } from "components/Markup"

interface SocialButtonsProps {
  liked?: boolean
  commentsEnabled?: boolean
}

export function SocialButtons({ liked, commentsEnabled = true }: SocialButtonsProps) {
  return (
    <Flex justify="between">
      <Flex style={{ paddingLeft: Units.margin }}>
        {commentsEnabled ? null : (
          <SMALL style={{ color: Colors.navBarText }}>Comments are turned off</SMALL>
        )}
      </Flex>
      <Flex
        justify="end"
        align="center"
        style={{
          marginRight: Units.margin,
          marginTop: Units.margin / 2,
          marginBottom: Units.margin / 2,
        }}>
        <TouchIcon
          name="ios-open"
          size="md"
          onPress={() => alert("Send action\nFeature to come!")}
        />
        {commentsEnabled ? (
          <TouchIcon
            name="ios-chatbubbles"
            size="md"
            style={{ marginLeft: Units.margin / 4 }}
            onPress={() => alert("Share action\nFeature to come!")}
          />
        ) : null}
        <TouchIcon
          toggledNames={{ on: "heart", off: "hearto" }}
          size="md"
          style={{ marginLeft: Units.margin / 4 }}
          onPress={() => alert("Like action\nFeature to come!")}
          active={liked}
        />
      </Flex>
    </Flex>
  )
}
