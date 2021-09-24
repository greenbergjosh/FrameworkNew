import React from "react"
import styles from "../styles.scss"
import { Alert, Typography } from "antd"
import { AlertDisplayProps, TextDisplayProps } from "../types"

export function PlainText({ text, style }: TextDisplayProps) {
  return (
    <>
      <Typography.Text style={style}>{text}</Typography.Text>{" "}
    </>
  )
}

export function Title({ text, style, size }: TextDisplayProps) {
  return (
    <Typography.Title style={style} level={size}>
      {text}
    </Typography.Title>
  )
}

export function Paragraph({ text, style }: TextDisplayProps) {
  return <Typography.Paragraph style={style}>{text}</Typography.Paragraph>
}

export function Success({ text, description, banner, showIcon, closable, style }: AlertDisplayProps) {
  return (
    <Alert
      message={text}
      type="success"
      banner={banner}
      closable={closable}
      description={description}
      showIcon={showIcon}
      style={style}
    />
  )
}

export function Info({ text, description, banner, showIcon, closable, style }: AlertDisplayProps) {
  return (
    <Alert
      message={text}
      type="info"
      banner={banner}
      closable={closable}
      description={description}
      showIcon={showIcon}
      style={style}
    />
  )
}

export function Warning({ text, description, banner, showIcon, closable, style }: AlertDisplayProps) {
  return (
    <Alert
      message={text}
      type="warning"
      banner={banner}
      closable={closable}
      description={description}
      showIcon={showIcon}
      style={style}
    />
  )
}

export function Error({ text, description, banner, showIcon, closable, style }: AlertDisplayProps) {
  return (
    <Alert
      message={text}
      type="error"
      banner={banner}
      closable={closable}
      description={description}
      showIcon={showIcon}
      style={style}
    />
  )
}

export function CodeBlock({ text, style }: TextDisplayProps) {
  return (
    <pre>
      <Typography.Text style={style} code copyable className={styles.codeBlock}>
        {text}
      </Typography.Text>
    </pre>
  )
}
