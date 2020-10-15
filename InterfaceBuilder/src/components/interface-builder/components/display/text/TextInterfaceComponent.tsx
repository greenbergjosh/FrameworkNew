import React, { CSSProperties } from "react"
import { textManageForm } from "./text-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { TextInterfaceComponentProps, TextInterfaceComponentState, TitleSizeType } from "./types"
import { get, isEmpty, isEqual, isObject } from "lodash/fp"
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
      const nextValue = get(this.props.valueKey, this.props.userInterfaceData)
      const text = this.getText(nextValue)

      this.setState({ text })
    }
  }

  componentDidUpdate(prevProps: Readonly<TextInterfaceComponentProps>): void {
    const prevValue = get(prevProps.valueKey, prevProps.userInterfaceData)
    const nextValue = get(this.props.valueKey, this.props.userInterfaceData)

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
    const { stringTemplate, useTokens } = this.props
    return useTokens ? replaceTokens(stringTemplate, value) : stringTemplate
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
    let headerSizeNum: TitleSizeType = getHeaderSizeNum(headerSize)

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
function replaceTokens(stringTemplate: string, value: string | JSONRecord): string | null {
  /*
   * When there is a single value, the user should
   * just provide {$} in the template string.
   */
  if (value && !isObject(value)) {
    return stringTemplate.replace("{$}", value.toString())
  }

  const matches = stringTemplate && stringTemplate.match(/(\{\$\.([^{]*)\})/gm)
  return (
    matches &&
    matches.reduce((acc, match) => {
      const key = match.slice(3, match.length - 1)
      const val = get(key, value) || "?"
      return acc.replace(match, val.toString())
    }, stringTemplate)
  )
}
