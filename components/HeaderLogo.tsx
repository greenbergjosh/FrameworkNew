import React from "react"
import { Image, Text, View } from "react-native"

interface HeaderLogoProps {
  title?: string
}

export class HeaderLogo extends React.Component<HeaderLogoProps> {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {this.props.title && <Text>{this.props.title}</Text>}
        <Image source={require("../assets/logo.png")} style={{ width: 124, height: 45 }} />
      </View>
    )
  }
}
