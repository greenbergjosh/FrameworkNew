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

export const TouchText = ({
  size = "md",
  onPress,
  style,
  labelStyle,
  children,
  reverse,
  type
}: TouchTextProps) => {
  /*
  NOTE: We use a negative margin to compensate for the 40x40px touch area
  when the touch area is larger than the icon itself. Otherwise, the icon
  will have too much space around it.
   */
  let margin = 0
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
  let addStyles = {}
  if (reverse) {
    addStyles = { ...addStyles, color: Colors.white }
  }
  if (type === "primary") {
    addStyles = { ...addStyles, fontWeight: FontWeights.bold }
  }
  if (type === "warning") {
    addStyles = { ...addStyles, color: Colors.red }
  }

  return (
    <>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress && onPress}
          style={[
            {
              minHeight: Units.minTouchArea,
              minWidth: Units.minTouchArea,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
            style,
          ]}>
          <Text style={[fontStyle, { flex: 0, alignSelf: "auto" }, addStyles, labelStyle]}>
            {children}
          </Text>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            {
              minHeight: Units.minTouchArea,
              minWidth: Units.minTouchArea,
              marginLeft: margin,
              marginRight: margin,
              marginTop: margin,
              marginBottom: margin,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
            style,
          ]}>
          <Text style={[fontStyle, { flex: 0, alignSelf: "auto" }, addStyles, labelStyle]}>
            {children}
          </Text>
        </View>
      )}
    </>
  )
}
