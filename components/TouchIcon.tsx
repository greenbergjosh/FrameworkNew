import React from "react"
import { StyleProp, TextStyle, TouchableOpacity } from "react-native"
import { Icon } from "@ant-design/react-native"
import { IconNames, IconProps } from "@ant-design/react-native/lib/icon"
import { Colors } from "constants"

interface TouchIconProps {
  size?: IconProps["size"]
  name: IconNames
  onPress?: () => void
  style?: StyleProp<TextStyle>
}

export const TouchIcon = ({ size = "md", name = "question", onPress, style }: TouchIconProps) => {
  return (
    <TouchableOpacity
      onPress={onPress && onPress}
      style={{
        minHeight: 40,
        minWidth: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Icon
        name={name}
        size={size}
        style={[{ color: Colors.black, flex: 0, alignSelf: "auto" }, style]}
      />
    </TouchableOpacity>
  )
}
