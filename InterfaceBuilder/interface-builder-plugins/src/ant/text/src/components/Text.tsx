import React, { CSSProperties } from "react"
import { CodeBlock, Error, Info, Paragraph, PlainText, Success, Title, Warning } from "./TextTypes"
import { TextInterface, TitleSizeType } from "../types"

export function Text({
  textType,
  headerSize,
  center,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  banner,
  closable,
  description,
  showIcon,
  stringTemplate,
}: TextInterface): JSX.Element {
  const style: CSSProperties = {}
  const headerSizeNum: TitleSizeType = getHeaderSizeNum(headerSize)

  marginTop ? (style.marginTop = marginTop) : null
  marginRight ? (style.marginRight = marginRight) : null
  marginBottom ? (style.marginBottom = marginBottom) : null
  marginLeft ? (style.marginLeft = marginLeft) : null
  center ? (style.textAlign = "center") : null

  switch (textType) {
    case "code":
      return <CodeBlock text={stringTemplate} style={style} />
    case "paragraph":
      return <Paragraph text={stringTemplate} style={style} />
    case "title":
      return <Title text={stringTemplate} size={headerSizeNum} style={style} />
    case "success":
      return (
        <Success
          text={stringTemplate}
          banner={banner}
          closable={closable}
          description={description}
          showIcon={showIcon}
          style={style}
        />
      )
    case "info":
      return (
        <Info
          text={stringTemplate}
          banner={banner}
          closable={closable}
          description={description}
          showIcon={showIcon}
          style={style}
        />
      )
    case "warning":
      return (
        <Warning
          text={stringTemplate}
          banner={banner}
          closable={closable}
          description={description}
          showIcon={showIcon}
          style={style}
        />
      )
    case "error":
      return (
        <Error
          text={stringTemplate}
          banner={banner}
          closable={closable}
          description={description}
          showIcon={showIcon}
          style={style}
        />
      )
    default:
      return <PlainText text={stringTemplate} style={style} />
  }
}

export function getHeaderSizeNum(headerSize: string | undefined): TitleSizeType {
  switch (headerSize) {
    case "1":
      return 1
    case "2":
      return 2
    case "3":
      return 3
    case "4":
      return 4
  }
}
