import React from "react"
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Colors, styles, FontWeights, devBorder, Units } from "constants"

interface TouchTextProps {
  size?: "sm" | "md" | "lg"
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  children?: string
  reverse?: boolean
  type?: "primary" | "warning" | "normal"
  disabled?: boolean
}

export default function TouchText({
  size = "md",
  onPress,
  style,
  labelStyle,
  children,
  type,
  reverse = false,
  disabled = false,
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: disabled ? Units.disabledOpacity : 1,
  }
  let defaultLabelStyle: StyleProp<TextStyle> = { flex: 0, alignSelf: "auto" }
  if (reverse) {
    defaultLabelStyle.color = Colors.reverse
  }
  if (type === "primary") {
    defaultLabelStyle.fontWeight = FontWeights.bold
  }
  if (type === "warning") {
    defaultLabelStyle.color = Colors.warning
  }

  return (
    <>
      {disabled ? (
        <View style={[wrapperStyles, style]}>
          <Text style={[fontStyle, defaultLabelStyle, labelStyle]}>{children}</Text>
        </View>
      ) : onPress ? (
        <TouchableOpacity
          onPress={onPress && onPress}
          style={[wrapperStyles, style]}>
          <Text style={[fontStyle, defaultLabelStyle, labelStyle]}>{children}</Text>
        </TouchableOpacity>
      ) : (
        <View style={[wrapperStyles, style]}>
          <Text style={[fontStyle, defaultLabelStyle, labelStyle]}>{children}</Text>
        </View>
      )}
    </>
  )
}
