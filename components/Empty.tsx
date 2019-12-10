import { Icon } from "@ant-design/react-native"
import React, { FunctionComponent } from "react"
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native"

export interface EmptyProps {
  message?: string | React.ReactNode
  style?: StyleProp<ViewStyle>
  iconStyle?: StyleProp<TextStyle>
}

export const Empty: FunctionComponent<EmptyProps> = ({ message, style, iconStyle }) => {
  return (
    <View style={[{ flex: 1, justifyContent: "center", alignItems: "center" }, style]}>
      <Icon name="inbox" size="md" style={iconStyle} />
      {React.isValidElement(message) ? message : <Text>{message || "No Items"}</Text>}
    </View>
  )
}
