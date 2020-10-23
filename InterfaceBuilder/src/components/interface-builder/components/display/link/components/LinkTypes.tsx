import { LinkDisplayProps } from "../types"
import { Button } from "antd"
import React from "react"

export function LinkButton({ linkLabel, uri, disabled, linkType, onClick }: LinkDisplayProps) {
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

export function Link({ linkLabel, uri, disabled, linkType, onClick }: LinkDisplayProps) {
  return (
    <Button type={linkType} href={uri} disabled={disabled}>
      {linkLabel}
    </Button>
  )
}
