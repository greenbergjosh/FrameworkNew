import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import TouchText from "./TouchText"
import { Units } from "styles"
import TouchIcon from "./TouchIcon"
import { ExpoIconType } from "../@types/expo-icon-type"

interface NavButtonProps {
  onPress?: () => void
  children?: string
  type?: "primary" | "warning" | "normal"
  disabled?: boolean
  position: "left" | "right"
  iconName?: ExpoIconType
}

export default function NavButton({
  onPress,
  children = "Untitled Button",
  type,
  disabled,
  position,
  iconName,
}: NavButtonProps) {
  let defaultStyle: StyleProp<ViewStyle> = {}
  let margin = iconName ? Units.margin / 2 : Units.margin
  if (position === "left") {
    defaultStyle.marginLeft = margin
  } else {
    defaultStyle.marginRight = margin
  }

  if (iconName) {
    return <TouchIcon name={iconName} reverse size="md" onPress={onPress} style={defaultStyle} />
  }
  return (
    <TouchText
      disabled={disabled}
      style={defaultStyle}
      reverse
      type={type}
      size="lg"
      onPress={onPress}>
      {children}
    </TouchText>
  )
}
