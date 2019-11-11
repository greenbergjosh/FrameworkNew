import { Typography } from "antd"
import React from "react"

const getLength = (value: string): number => {
  return typeof value !== "undefined" && value.length ? value.length : 0
}

const CharCounter = (
  { text, maxLength, className }:
    { text: string, maxLength: number | undefined, className?: string | undefined },
) => {
  if (!maxLength) return null
  return (
    <Typography.Text
      type="secondary"
      className={className}
      style={{
        display: "block",
        textAlign: "right",
        fontSize: "0.85em",
        lineHeight: "12px",
      }}
    >{getLength(text)}/{maxLength}</Typography.Text>
  )
}

export default CharCounter