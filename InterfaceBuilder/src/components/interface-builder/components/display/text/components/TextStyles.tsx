import { TextDisplayProps } from "../types"
import { Skeleton, Typography } from "antd"
import { isEmpty } from "lodash/fp"
import React from "react"
import styles from "./styles.scss"

export function PlainText({ text }: TextDisplayProps) {
  return (
    <Skeleton paragraph={{ rows: 1 }} loading={isEmpty(text)}>
      <Typography.Text>{text}</Typography.Text>{" "}
    </Skeleton>
  )
}

export function Title({ text }: TextDisplayProps) {
  return (
    <Skeleton paragraph={{ rows: 1 }} loading={isEmpty(text)}>
      <Typography.Title>{text}</Typography.Title>{" "}
    </Skeleton>
  )
}

export function Paragraph({ text }: TextDisplayProps) {
  return (
    <Skeleton loading={isEmpty(text)}>
      <Typography.Paragraph>{text}</Typography.Paragraph>
    </Skeleton>
  )
}

export function CodeBlock({ text }: TextDisplayProps) {
  return (
    <Typography.Text code copyable className={styles.codeBlock}>
      {text}
    </Typography.Text>
  )
}
