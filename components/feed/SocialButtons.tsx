import React from "react"
import { Flex } from "@ant-design/react-native"
import TouchIcon from "components/TouchIcon"
import { Units, Colors } from "constants"
import { SMALL } from "components/Markup"
import { PostShareModal } from "./PostShareModal"
import { NavigationTabScreenProps } from "react-navigation-tabs"

interface SocialButtonsProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  liked?: boolean
  commentsEnabled?: boolean
}

export function SocialButtons({ navigate, liked, commentsEnabled = true }: SocialButtonsProps) {
  const [showShareModal, setShowShareModal] = React.useState(false)

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
        <TouchIcon name="md-share" size="md" onPress={() => setShowShareModal(true)} />
        <PostShareModal
          onClose={() => setShowShareModal(false)}
          visible={showShareModal}
          navigate={navigate}
        />
        <TouchIcon
          name="ios-chatbubbles"
          size="md"
          style={{ marginLeft: Units.margin / 4 }}
          onPress={() => alert("Open Comments action\nFeature to come!")}
        />
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
