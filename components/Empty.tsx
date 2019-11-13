import { Icon } from "@ant-design/react-native"
import React, { FunctionComponent } from "react"
import { Text, View, ViewStyle } from "react-native"

export interface EmptyProps {
  message?: string | React.ReactNode
  style?: ViewStyle
}

export const Empty: FunctionComponent<EmptyProps> = ({ message, style = {} }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", ...(style || {}) }}>
      <Icon name="inbox" size="lg" style={{ fontSize: 25 }} />
      {React.isValidElement(message) ? message : <Text>{message || "No Items"}</Text>}
    </View>
  )
}
