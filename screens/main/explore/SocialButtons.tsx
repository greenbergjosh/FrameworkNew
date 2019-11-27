import React from "react"
import { Flex } from "@ant-design/react-native"
import { TouchIcon } from "components/TouchIcon"

export default function SocialButtons() {
  return <Flex justify="end" style={{ marginRight: 10 }}>
    <TouchIcon
      name="question"
      size="md"
      style={{ marginLeft: 10 }}
      onPress={() => alert("Feature to come!")}
    />
    <TouchIcon
      name="share-alt"
      size="md"
      style={{ marginLeft: 10 }}
      onPress={() => alert("Feature to come!")}
    />
    <TouchIcon
      name="heart"
      size="md"
      style={{ marginLeft: 10 }}
      onPress={() => alert("Feature to come!")}
    />
  </Flex>
}