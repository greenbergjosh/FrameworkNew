import React from "react"
import { StyleProp, TextStyle } from "react-native"
import AwardSvg from "./award.svg"

export type IconProps = {
  key?: string | number,
  style?: StyleProp<TextStyle>
}

export const AwardIcon = ({ key, style }: IconProps) => (
  <AwardSvg width="17" height="20" key={key} style={style} />
)
