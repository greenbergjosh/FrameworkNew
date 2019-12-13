import { Flex, Icon } from "@ant-design/react-native"
import { AntIconSizes, Colors } from "constants"
import React from "react"

export function ExpanderIcon(props: { collapsed: boolean }) {
  return (
    <Flex>
      <Icon
        name={props.collapsed ? "down" : "up"}
        color={Colors.bodyText}
        size={AntIconSizes.xxs}
        style={{
          position: "absolute",
          bottom: -8,
          borderRadius: 11,
          height: 22,
          width: 22,
          backgroundColor: "white",
          overflow: "hidden",
          textAlign: "center",
          lineHeight: 22,
        }}
      />
    </Flex>
  )
}
