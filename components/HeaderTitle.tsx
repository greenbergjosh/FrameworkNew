import React from "react"
import { Image, Text, View } from "react-native"

interface HeaderTitleProps {
  title?: string
}

export class HeaderTitle extends React.Component<HeaderTitleProps> {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {this.props.title && (
          <Text style={{ color: "#fff", fontSize: 24 }}>{this.props.title}</Text>
        )}
      </View>
    )
  }
}
