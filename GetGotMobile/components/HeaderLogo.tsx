import React from "react"
import { Image, View } from "react-native"

export interface HeaderLogoProps {}

export const HeaderLogo = ({}: HeaderLogoProps) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image source={require("assets/logo.png")} style={{ width: 124, height: 45 }} />
    </View>
  )
}
