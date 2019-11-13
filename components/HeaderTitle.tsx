import React from "react"
import { Image, Text, View } from "react-native"

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

    let alignment: "flex-start" | "flex-end" | "center" =
      align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"
    let padding = offset === "left" ? { left: -40 } : offset === "right" ? { left: 40 } : {}
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: alignment, ...padding }}>
        {this.props.title && (
          <Text style={{ color: "#fff", fontSize: 24, paddingLeft: 10, paddingRight: 10 }}>
            {this.props.title}
          </Text>
        )}
      </View>
    )
  }
}
