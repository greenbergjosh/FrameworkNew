import React from "react"
import { StyleProp, TextStyle, TouchableOpacity } from "react-native"
import { Icon } from "@ant-design/react-native"
import { IconNames, IconProps } from "@ant-design/react-native/lib/icon"
import { Colors, styles, Units } from "constants"

interface TouchIconProps {
  size?: IconProps["size"]
  name: IconNames
  onPress?: () => void
  style?: StyleProp<TextStyle>
}

export const TouchIcon = ({ size = "md", name = "question", onPress, style }: TouchIconProps) => {
  /*
  NOTE: We use a negative margin to compensate for the 40x40px touch area
  when the touch area is larger than the icon itself. Otherwise, the icon
  will have too much space around it.
   */
  let margin = 0
  switch (size) {
    case "xs":
      margin = (Units.avatarXS - Units.minTouchArea) / 2
      break
    case "sm":
      margin = (Units.avatarSM - Units.minTouchArea) / 2
      break
  }

  return (
    <TouchableOpacity
      onPress={onPress && onPress}
      style={{
        minHeight: Units.minTouchArea,
        minWidth: Units.minTouchArea,
        marginLeft: margin,
        marginRight: margin,
        marginTop: margin,
        marginBottom: margin,
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
