import { StyleProp, View, ViewStyle } from "react-native"
import { Colors, styles, Units } from "constants"
import TouchIcon from "./TouchIcon"
import { H3 } from "./Markup"
import React from "react"

export interface SubHeaderProps {
  onLeftPress?: () => void
  onRightPress?: () => void
  title: string
  align?: "left" | "center" | "right"
}

export function SubHeader({ title, onLeftPress, onRightPress, align = "center" }: SubHeaderProps) {
  let alignItems
  switch (align) {
    case "left":
      alignItems = "flex-start"
      break
    case "right":
      alignItems = "flex-end"
      break
    default:
      alignItems = "center"
  }
  const titleStyle: StyleProp<ViewStyle> = {
    flexGrow: 1,
    flexShrink: 1,
    alignItems,
    marginRight: onRightPress ? 0 : Units.img24,
    marginLeft: onLeftPress ? 0 : Units.img24,
  }
  return (
    <View style={[styles.SubHeader, {}]}>
      {onLeftPress ? (
        <View style={{ flexGrow: 0, flexShrink: 1 }}>
          <TouchIcon name="left" onPress={onLeftPress} iconStyle={{ color: Colors.bodyText }} />
        </View>
      ) : null}
      <View style={titleStyle}>
        <H3>{title}</H3>
      </View>
      {onRightPress ? (
        <View style={{ flexGrow: 0, flexShrink: 1 }}>
          <TouchIcon name="right" onPress={onRightPress} iconStyle={{ color: Colors.bodyText }} />
        </View>
      ) : null}
    </View>
  )
}
