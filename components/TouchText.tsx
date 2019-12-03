import React from "react"
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { IconProps } from "@ant-design/react-native/lib/icon"
import { AntIconSizes, Colors, styles, Units } from "constants"
import { FontWeights } from "../constants/unit.constants"

interface TouchTextProps {
  size?: "sm" | "md" | "lg"
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  children?: string
  reverse?: boolean
  type?: "primary" | "warning"
}

export default function TouchText({
  size = "md",
  onPress,
  style,
  labelStyle,
  children,
  reverse,
  type,
}: TouchTextProps) {
  /*
  NOTE: We use a negative margin to compensate for the 40x40px touch area
  when the touch area is larger than the icon itself. Otherwise, the icon
  will have too much space around it.
   */
  let fontStyle: StyleProp<TextStyle> = styles.LinkText
  switch (size) {
    case "sm":
      fontStyle = styles.SmallCopy
      break
    case "md":
      fontStyle = styles.LinkText
      break
    case "lg":
      fontStyle = styles.H3
      break
  }

  let wrapperStyles: StyleProp<ViewStyle> = {
    minHeight: Units.minTouchArea,
    minWidth: Units.minTouchArea,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }
  let conditionalLabelStyles: StyleProp<TextStyle> = { flex: 0, alignSelf: "auto" }
  if (reverse) {
    conditionalLabelStyles.color = Colors.white
  }
  if (type === "primary") {
    conditionalLabelStyles.fontWeight = FontWeights.bold
  }
  if (type === "warning") {
    conditionalLabelStyles.color = Colors.red
  }

  return (
    <>
      {onPress ? (
        <TouchableOpacity onPress={onPress && onPress} style={[wrapperStyles, style]}>
          <Text style={[fontStyle, conditionalLabelStyles, labelStyle]}>{children}</Text>
        </TouchableOpacity>
      ) : (
        <View style={[wrapperStyles, style]}>
          <Text style={[fontStyle, conditionalLabelStyles, labelStyle]}>{children}</Text>
        </View>
      )}
    </>
  )
}
