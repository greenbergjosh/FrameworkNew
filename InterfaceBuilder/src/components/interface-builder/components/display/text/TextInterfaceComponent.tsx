import React from "react"
import { textManageForm } from "./text-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { TextInterfaceComponentProps, TextInterfaceComponentState } from "./types"
import { get, isEmpty, isEqual } from "lodash/fp"
import { JSONRecord } from "index"
import { CodeBlock, Paragraph, PlainText, Title } from "./components/TextStyles"

export class TextInterfaceComponent extends BaseInterfaceComponent<
  TextInterfaceComponentProps,
  TextInterfaceComponentState
> {
  constructor(props: TextInterfaceComponentProps) {
    super(props)

    this.state = {
      text: null,
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
      const nextValue = this.props.userInterfaceData[this.props.valueKey]
      const text = this.getText(nextValue)

      this.setState({ text })
    }
  }

  componentDidUpdate(prevProps: Readonly<TextInterfaceComponentProps>): void {
    const prevValue = prevProps.userInterfaceData[prevProps.valueKey]
    const nextValue = this.props.userInterfaceData[this.props.valueKey]

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
    const { textStyle } = this.props

    switch (textStyle) {
      case "code":
        return <CodeBlock text={this.state.text} />
      case "paragraph":
        return <Paragraph text={this.state.text} />
      case "title":
        return <Title text={this.state.text} />
      default:
        return <PlainText text={this.state.text} />
    }
  }
}

function replaceTokens(stringTemplate: string, value: string | JSONRecord): string | null {
  const matches = stringTemplate && stringTemplate.match(/(\{\$\.([^{]*)\})/gm)
  return (
    matches &&
    matches.reduce((acc, match) => {
      const key = match.slice(3, match.length - 1)
      const val = get(key, value) || "?"
      return acc.replace(match, val)
    }, stringTemplate)
  )
}
