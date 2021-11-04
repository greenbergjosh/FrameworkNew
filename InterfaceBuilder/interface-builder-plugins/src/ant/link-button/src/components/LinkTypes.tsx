import React from "react"
import { Button } from "antd"
import { LinkButtonDisplayProps } from "../types"

export function LinkButton({ linkLabel, uri, disabled, linkType, onClick }: LinkButtonDisplayProps) {
  const handleClick = (): void => {
    if (onClick) {
      onClick(uri)
    }
  }

  return (
    <Button type={linkType} onClick={handleClick} disabled={disabled}>
      {linkLabel}
    </Button>
  )
}

export function Link({ linkLabel, uri, disabled, linkType, onClick }: LinkButtonDisplayProps) {
  return (
    <Button type={linkType} href={uri} disabled={disabled}>
      {linkLabel}
    </Button>
  )
}
