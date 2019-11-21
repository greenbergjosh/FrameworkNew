import React from "react"
import { Image, Text, View } from "react-native"
import { styles, Colors } from "constants"

interface HeaderLogoProps {
  title?: string
}

export const HeaderLogo = ({ title }: HeaderLogoProps) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {title && <Text style={[styles.SmallCopy, { color: Colors.grey }]}>This view: {title}</Text>}
      <Image source={require("../assets/logo.png")} style={{ width: 124, height: 45 }} />
    </View>
  )
}
