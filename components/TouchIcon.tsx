import React from "react"
import { StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Icon } from "@ant-design/react-native"
import { IconNames, IconProps } from "@ant-design/react-native/lib/icon"
import { AntIconSizes, Colors, Units } from "constants"

interface TouchIconProps {
  size?: IconProps["size"]
  name: IconNames
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  iconStyle?: StyleProp<TextStyle>
  reverse?: boolean
}

function getMargin(iconSize) {
  return ((Units.minTouchArea - iconSize) / 2) * -1
}

export default function TouchIcon({
  size = "md",
  name = "question",
  onPress,
  style,
  iconStyle,
  reverse,
}: TouchIconProps) {
  /*
  NOTE: We use a negative margin to compensate for the 40x40px touch area
  when the touch area is larger than the icon itself. Otherwise, the icon
  will have too much space around it.
   */
  let margin = 0
  switch (size) {
    case "xs":
      margin = getMargin(AntIconSizes.xs)
      break
    case "sm":
      margin = getMargin(AntIconSizes.sm)
      break
    case "md":
      margin = getMargin(AntIconSizes.md)
      break
    case "lg":
      margin = getMargin(AntIconSizes.lg)
      break
    default:
      if (typeof size === "number") margin = getMargin(size)
  }

  let wrapperStyles: StyleProp<ViewStyle> = {
    minHeight: Units.minTouchArea,
    minWidth: Units.minTouchArea,
    marginLeft: margin,
    marginRight: margin,
    marginTop: margin,
    marginBottom: margin,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }
  let conditionalIconStyles: StyleProp<TextStyle> = {
    color: Colors.black,
    flex: 0,
    alignSelf: "auto",
  }
  if (reverse) {
    conditionalIconStyles.color = Colors.white
  }

  return (
    <>
      {onPress ? (
        <TouchableOpacity onPress={onPress && onPress} style={[wrapperStyles, style]}>
          <Icon name={name} size={size} style={[conditionalIconStyles, iconStyle]} />
        </TouchableOpacity>
      ) : (
        <View style={[wrapperStyles, style]}>
          <Icon name={name} size={size} style={[conditionalIconStyles, iconStyle]} />
        </View>
      )}
    </>
  )
}
