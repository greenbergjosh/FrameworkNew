import React, { CSSProperties } from "react"
import { textManageForm } from "./text-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { TextInterfaceComponentProps, TextInterfaceComponentState, TitleSizeType } from "./types"
import { get, isBoolean, isEmpty, isEqual, isNumber, isString } from "lodash/fp"
import { JSONRecord } from "index"
import { CodeBlock, Error, Info, Paragraph, PlainText, Success, Title, Warning } from "./components/TextTypes"

function getHeaderSizeNum(headerSize: string | undefined): TitleSizeType {
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

export class TextInterfaceComponent extends BaseInterfaceComponent<
  TextInterfaceComponentProps,
  TextInterfaceComponentState
> {
  constructor(props: TextInterfaceComponentProps) {
    super(props)

    this.state = {
      text: " ",
    }
  }

  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
    showBorder: true,
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "text",
      title: "Text",
      icon: "font-size",
      description: `Enter text to display.
        ADVANCED: You can include simple jsonPath expressions like "{$.propertyName}".`,
      componentDefinition: {
        component: "text",
        components: [],
      },
    }
  }

  static manageForm = textManageForm

  componentDidMount(): void {
    if (!isEmpty(this.props.stringTemplate)) {
      const nextValue = this.getValue(this.props.valueKey)
      const text = this.getText(nextValue)

      this.setState({ text })
    }
  }

  componentDidUpdate(prevProps: Readonly<TextInterfaceComponentProps>): void {
    const prevValue = this.getValue(prevProps.valueKey, prevProps.userInterfaceData, prevProps.getRootUserInterfaceData)
    const nextValue = this.getValue(this.props.valueKey)

    /*
     * Recalculate text if:
     * User just turned tokens on or off
     * User just changed the stringTemplate
     * Tokens is on and the token value data has changed
     */
    if (
      this.props.useTokens !== prevProps.useTokens ||
      this.props.stringTemplate !== prevProps.stringTemplate ||
      (this.props.useTokens && !isEqual(prevValue, nextValue))
    ) {
      const text = this.getText(nextValue)
      this.setState({ text })
    }
  }

  private getText(value: string | JSONRecord): string | null {
    const { stringTemplate, useTokens, valueKey } = this.props
    return useTokens ? replaceTokens(stringTemplate, value, valueKey) : stringTemplate
  }

  render() {
    const {
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
    } = this.props
    const style: CSSProperties = {}
    const headerSizeNum: TitleSizeType = getHeaderSizeNum(headerSize)

    marginTop ? (style.marginTop = marginTop) : null
    marginRight ? (style.marginRight = marginRight) : null
    marginBottom ? (style.marginBottom = marginBottom) : null
    marginLeft ? (style.marginLeft = marginLeft) : null
    center ? (style.textAlign = "center") : null

    switch (textType) {
      case "code":
        return <CodeBlock text={this.state.text} style={style} />
      case "paragraph":
        return <Paragraph text={this.state.text} style={style} />
      case "title":
        return <Title text={this.state.text} size={headerSizeNum} style={style} />
      case "success":
        return (
          <Success
            text={this.state.text}
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
            text={this.state.text}
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
            text={this.state.text}
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
            text={this.state.text}
            banner={banner}
            closable={closable}
            description={description}
            showIcon={showIcon}
            style={style}
          />
        )
      default:
        return <PlainText text={this.state.text} style={style} />
    }
  }
}

/**
 *
 * @param stringTemplate
 * @param value
 */
function replaceTokens(stringTemplate: string, value: string | JSONRecord, valueKey: string): string | null {
  /*
   * When value is a primitive, we skip all the regex work and just replace the value.
   * The user should have provided {$} in the template string.
   */
  if (isString(value) || isNumber(value) || isBoolean(value)) {
    return stringTemplate.replace("{$}", value.toString())
  }

  const matches = stringTemplate && stringTemplate.match(/(\{(\$\.?[^{]*)\})/gm)
  return (
    matches &&
    matches.reduce((acc, token) => {
      console.log("replaceToken", { stringTemplate, value, matches, acc, token })

      // The token is simple "{$}"
      if (token === "{$}") {
        const defaultValue = `{${valueKey}}`
        const val = value ? value.toString() : defaultValue
        return acc.replace(token, val)
      }

      // The token is a property such as "$.propertyName"
      const key = token.slice(3, token.length - 1)
      const defaultValue = `{${valueKey}.${key}}`
      const val = get(key, value) || defaultValue
      return acc.replace(token, val.toString())
    }, stringTemplate)
  )
}
