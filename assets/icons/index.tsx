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
// @ts-ignore
import DeleteSvg from "./delete.svg"
// @ts-ignore
import ArchiveSvg from "./archive.svg"
// @ts-ignore
import ArrowUpSvg from "./arrow-up.svg"
// @ts-ignore
import ArrowDownSvg from "./arrow-down.svg"

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

export const DeleteIcon = ({ key, style, width = 20, height = 26, scale = 1 }: IconProps) => (
  <DeleteSvg width={width * scale} height={height * scale} key={key} style={style} />
)

export const ArchiveIcon = ({ key, style, width = 20, height = 19, scale = 1 }: IconProps) => (
  <ArchiveSvg width={width * scale} height={height * scale} key={key} style={style} />
)

export const ArrowUpIcon = ({ key, style, width = 13, height = 8, scale = 1 }: IconProps) => (
  <ArrowUpSvg width={width * scale} height={height * scale} key={key} style={style} />
)

export const ArrowDownIcon = ({ key, style, width = 12, height = 8, scale = 1 }: IconProps) => (
  <ArrowDownSvg width={width * scale} height={height * scale} key={key} style={style} />
)
