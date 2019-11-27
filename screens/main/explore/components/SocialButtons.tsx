import React from "react"
import { Flex } from "@ant-design/react-native"
import { TouchIcon } from "components/TouchIcon"
import { Units } from "constants"

export default function SocialButtons() {
  return (
    <Flex justify="end" style={{ marginRight: 10 }}>
      <TouchIcon
        name="question"
        size="md"
        iconStyle={{ marginLeft: Units.margin, fontSize: Units.iconLG }}
        onPress={() => alert("Send action\nFeature to come!")}
      />
      <TouchIcon
        name="share-alt"
        size="md"
        iconStyle={{ marginLeft: Units.margin, fontSize: Units.iconLG }}
        onPress={() => alert("Share action\nFeature to come!")}
      />
      <TouchIcon
        name="heart"
        size="md"
        iconStyle={{ marginLeft: Units.margin, fontSize: Units.iconLG }}
        onPress={() => alert("Like action\nFeature to come!")}
      />
    </Flex>
  )
}
