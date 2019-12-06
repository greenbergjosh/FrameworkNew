import React from "react"
import { StyleProp, TextStyle } from "react-native"
// @ts-ignore
import AwardSvg from "./award.svg"
// @ts-ignore
import GiftSvg from "./gift.svg"
// @ts-ignore
import TagSvg from "./tag.svg"
// @ts-ignore
import UndoSvg from "./undo.svg"
// @ts-ignore
import ChatBubbleSvg from "./chat-bubble.svg"
// @ts-ignore
import SendSvg from "./send.svg"

export type IconProps = {
  key?: string | number
  style?: StyleProp<TextStyle>
  width?: number
  height?: number
  scale?: number
}

export const AwardIcon = ({ key, style, width = 17, height = 20, scale = 1 }: IconProps) => (
  <AwardSvg width={width * scale} height={height * scale} key={key} style={style} />
)

export const GiftIcon = ({ key, style, width = 20, height = 19, scale = 1 }: IconProps) => (
  <GiftSvg width={width * scale} height={height * scale} key={key} style={style} />
)

export const TagIcon = ({ key, style, width = 21, height = 21, scale = 1 }: IconProps) => (
  <TagSvg width={width * scale} height={height * scale} key={key} style={style} />
)

export const UndoIcon = ({ key, style, width = 26, height = 20, scale = 1 }: IconProps) => (
  <UndoSvg width={width * scale} height={height * scale} key={key} style={style} />
)

export const ChatBubbleIcon = ({ key, style, width = 25, height = 22, scale = 1 }: IconProps) => (
  <ChatBubbleSvg width={width * scale} height={height * scale} key={key} style={style} />
)

export const SendIcon = ({ key, style, width = 16, height = 24, scale = 1 }: IconProps) => (
  <SendSvg width={width * scale} height={height * scale} key={key} style={style} />
)
