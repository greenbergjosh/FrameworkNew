import React from "react"
import { Text, View } from "react-native"
import { Colors, styles, Units } from "styles"

interface HeaderTitleProps {
  title?: string
  align?: "left" | "center" | "right"
  offset?: "left" | "none" | "right"
  size?: "normal" | "large"
}

export class HeaderTitle extends React.Component<HeaderTitleProps> {
  static defaultProps = {
    align: "center",
    size: "normal",
    offset: "none",
  }
  render() {
    const { align, offset, size, title } = this.props

    const alignment: "flex-start" | "flex-end" | "center" =
      align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"
    const padding = offset === "left" ? { left: -40 } : offset === "right" ? { left: 40 } : {}
    const textClass = size === "large" ? styles.H1 : styles.H3
    const viewClass =
      size === "large"
        ? {
            paddingLeft: Units.margin,
            paddingRight: Units.margin,
          }
        : null

    return (
      <View
        style={[
          viewClass,
          { flex: 1, justifyContent: "center", alignItems: alignment, ...padding },
        ]}>
        {title && <Text style={[textClass, { color: Colors.reverse }]}>{title}</Text>}
      </View>
    )
  }
}
