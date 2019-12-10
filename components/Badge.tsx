import React, { FunctionComponent } from "react"
import { StyleProp, Text, View, ViewStyle } from "react-native"
import { styles } from "constants"
import { Colors } from "../constants/unit.constants"

export interface EmptyProps {
  style?: StyleProp<ViewStyle>
  text?: string | React.ReactNode
}

export const Badge: FunctionComponent<EmptyProps> = ({ style, text }) => {
  const containerStyle = {
    borderWidth: 1,
    borderColor: Colors.link,
    borderRadius: styles.SmallCopy.fontSize,
    minWidth: styles.SmallCopy.fontSize * 1.5,
    padding: 2,
    marginLeft: 2,
    marginRight: 2,
  }
  const textStyle = {
    lineHeight: styles.SmallCopy.fontSize,
    color: Colors.link,
    paddingLeft: 2,
    paddingRight: 2,
  }
  return (
    <View style={[containerStyle, style]}>
      <Text style={[styles.SmallCopy, textStyle]}>{text}</Text>
    </View>
  )
}
