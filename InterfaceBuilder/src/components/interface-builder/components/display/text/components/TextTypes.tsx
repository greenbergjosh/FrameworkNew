import { TextDisplayProps } from "../types"
import { Skeleton, Typography } from "antd"
import { isEmpty } from "lodash/fp"
import React from "react"
import styles from "./styles.scss"

export function PlainText({ text, style, }: TextDisplayProps) {
  return (
    <Skeleton paragraph={{ rows: 1 }} loading={isEmpty(text)}>
      <Typography.Text style={style}>{text}</Typography.Text>{" "}
    </Skeleton>
  )
}

export function Title({ text, style, size }: TextDisplayProps) {
  return (
    <Skeleton paragraph={{ rows: 1 }} loading={isEmpty(text)}>
      <Typography.Title style={style} level={size}>{text}</Typography.Title>{" "}
    </Skeleton>
  )
}

export function Paragraph({ text, style, }: TextDisplayProps) {
  return (
    <Skeleton loading={isEmpty(text)}>
      <Typography.Paragraph style={style}>{text}</Typography.Paragraph>
    </Skeleton>
  )
}

export function CodeBlock({ text, style, }: TextDisplayProps) {
  return (
    <Typography.Text style={style} code copyable className={styles.codeBlock}>
      {text}
    </Typography.Text>
  )
}
