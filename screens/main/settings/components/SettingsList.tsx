import { FlatList, StyleProp, ViewStyle } from "react-native"
import React from "react"
import { SettingRowProps, SettingRow } from "./SettingRow"

export type SettingType = {
  id: GUID
  title: string
  description: string
  checked: boolean
}

interface SettingsListProps {
  values: SettingType[]
  style?: StyleProp<ViewStyle>
  children?: (props: SettingRowProps) => React.ReactElement<any>
}

export const SettingsList = ({ values, style, children = SettingRow }: SettingsListProps) => {
  return (
    <FlatList
      data={values}
      renderItem={({ item }) => children({ value: item })}
      keyExtractor={(setting) => setting.id}
      style={style}
    />
  )
}
