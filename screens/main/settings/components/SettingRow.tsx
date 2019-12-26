import { Flex, Switch } from "@ant-design/react-native"
import { Colors, styles, Units } from "constants"
import { StyleProp, Text, TextStyle, ViewStyle } from "react-native"
import React from "react"
import { SettingType } from "api/profile-services"
import { H3, P } from "components/Markup"

export interface SettingRowProps {
  value: SettingType
  style?: StyleProp<ViewStyle>
  titleStyle?: StyleProp<TextStyle>
}

const defaultValue = {
  id: "e821cc0c-9bac-46f6-xw832f-2f6de345a296",
  title: "Untitled",
  description: "Description not available",
  checked: false,
}

export const SettingRow = ({ value = defaultValue, style, titleStyle }: SettingRowProps) => {
  const { id, title, description, checked } = value
  return (
    <Flex direction="row" align="start" style={[{ marginBottom: Units.margin }, style]}>
      <Flex direction="column" align="start" style={{ flexGrow: 0, flexShrink: 1 }}>
        <H3 style={[{ color: Colors.bodyTextEmphasis }, titleStyle]}>{title}</H3>
        <Text style={styles.Body}>{description}</Text>
      </Flex>
      <Flex justify="end" style={{ marginLeft: Units.margin, flexGrow: 1, flexShrink: 0 }}>
        <Switch checked={checked} />
      </Flex>
    </Flex>
  )
}
