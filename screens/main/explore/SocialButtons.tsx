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
        style={{ marginLeft: Units.margin, fontSize: Units.iconLG }}
        onPress={() => alert("Feature to come!")}
      />
      <TouchIcon
        name="share-alt"
        size="md"
        style={{ marginLeft: Units.margin, fontSize: Units.iconLG }}
        onPress={() => alert("Feature to come!")}
      />
      <TouchIcon
        name="heart"
        size="md"
        style={{ marginLeft: Units.margin, fontSize: Units.iconLG }}
        onPress={() => alert("Feature to come!")}
      />
    </Flex>
  )
}
