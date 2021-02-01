import React, { CSSProperties } from "react"
import { TextInterface, TitleSizeType } from "../types"
import { CodeBlock, Error, Info, Paragraph, PlainText, Success, Title, Warning } from "./TextTypes"
import { hasTokens, replaceTokens } from "lib/tokenReplacer"

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
  valueKey,
  data,
}: TextInterface): JSX.Element {
  const text = React.useMemo(() => {
    if (!hasTokens(stringTemplate)) {
      return stringTemplate
    }
    return replaceTokens(stringTemplate, data, valueKey)
  }, [data, stringTemplate, valueKey])

  const style: CSSProperties = {}
  const headerSizeNum: TitleSizeType = getHeaderSizeNum(headerSize)

  marginTop ? (style.marginTop = marginTop) : null
  marginRight ? (style.marginRight = marginRight) : null
  marginBottom ? (style.marginBottom = marginBottom) : null
  marginLeft ? (style.marginLeft = marginLeft) : null
  center ? (style.textAlign = "center") : null

  switch (textType) {
    case "code":
      return <CodeBlock text={text} style={style} />
    case "paragraph":
      return <Paragraph text={text} style={style} />
    case "title":
      return <Title text={text} size={headerSizeNum} style={style} />
    case "success":
      return (
        <Success
          text={text}
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
          text={text}
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
          text={text}
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
          text={text}
          banner={banner}
          closable={closable}
          description={description}
          showIcon={showIcon}
          style={style}
        />
      )
    default:
      return <PlainText text={text} style={style} />
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
