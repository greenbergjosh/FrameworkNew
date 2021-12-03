import React from "react"
import { AbstractBaseInterfaceComponentType, BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { isEmpty, isEqual, isObject } from "lodash/fp"
import { Link, LinkButton } from "./components/LinkTypes"
import { LinkButtonInterfaceComponentProps, LinkButtonInterfaceComponentState } from "./types"
import { settings } from "./settings"
import layoutDefinition from "./layoutDefinition"

export default class LinkButtonInterfaceComponent extends BaseInterfaceComponent<
  LinkButtonInterfaceComponentProps,
  LinkButtonInterfaceComponentState
> {
  constructor(props: LinkButtonInterfaceComponentProps) {
    super(props)

    this.state = {
      linkLabel: "",
      uri: "",
    }
  }

  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
    showBorder: true,

    // Additional props
    useLinkLabelKey: false,
    linkLabel: "",
    linkLabelKey: "",
    api: "",
    linkType: "link",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  componentDidMount(): void {
    const { useLinkLabelKey, linkLabelKey, linkLabel, uri, useUriTokens } = this.props

    // Label
    if (useLinkLabelKey && !isEmpty(linkLabelKey)) {
      const label = this.getValue(linkLabelKey) || "Link"
      this.setState({ linkLabel: label })
    } else if (!isEmpty(linkLabel)) {
      this.setState({ linkLabel })
    } else {
      this.setState({ linkLabel: "Link" })
    }

    // URI
    if (!isEmpty(uri)) {
      const nextUri = useUriTokens ? replaceUriTokens(uri, this.getValue.bind(this)) : uri
      this.setState({ uri: nextUri })
    }
  }

  componentDidUpdate(prevProps: Readonly<LinkButtonInterfaceComponentProps>): void {
    const { useLinkLabelKey, linkLabelKey, linkLabel } = this.props

    /*
     * Recalculate Label
     */
    const prevUseLinkLabelKey = prevProps.useLinkLabelKey
    const nextUxeLinkLableKey = this.props.useLinkLabelKey
    const prevLinkLabelKey = prevProps.linkLabelKey
    const nextLinkLabelKey = this.props.linkLabelKey
    const prevLinkLabel = prevProps.linkLabel
    const nextLinkLabel = this.props.linkLabel
    if (
      prevUseLinkLabelKey !== nextUxeLinkLableKey ||
      prevLinkLabelKey !== nextLinkLabelKey ||
      prevLinkLabel !== nextLinkLabel
    ) {
      if (useLinkLabelKey && !isEmpty(linkLabelKey)) {
        const label = this.getValue(linkLabelKey) || "Link"
        this.setState({ linkLabel: label })
      } else if (!isEmpty(linkLabel)) {
        this.setState({ linkLabel })
      } else {
        this.setState({ linkLabel: "Link" })
      }
    }

    /*
     * Recalculate URI if:
     * User just turned tokens on or off
     * User just changed the URI
     * Tokens is on and the token value data has changed
     */
    if (
      this.props.useUriTokens !== prevProps.useUriTokens ||
      this.props.uri !== prevProps.uri ||
      (this.props.useUriTokens && !isEqual(prevProps.userInterfaceData, this.props.userInterfaceData))
    ) {
      const uri = this.props.useUriTokens ? replaceUriTokens(this.props.uri, this.getValue.bind(this)) : this.props.uri
      this.setState({ uri })
    }
  }

  // TODO: handleClick should navigate to path

  render(): JSX.Element {
    const { onClick, mode, linkType } = this.props
    const { linkLabel, uri } = this.state

    if (onClick) {
      return (
        <LinkButton linkLabel={linkLabel} uri={uri} onClick={onClick} disabled={mode === "edit"} linkType={linkType} />
      )
    }
    return <Link linkLabel={linkLabel} uri={uri} disabled={mode === "edit"} linkType={linkType} />
  }
}

/**
 * When there is a single value, the user should just provide {$} in the template string.
 * @param uriTemplate
 * @param getValue
 */
function replaceUriTokens(
  uriTemplate: string,
  getValue: AbstractBaseInterfaceComponentType["prototype"]["getValue"]
): string {
  // One token and one value
  const hasOneToken = uriTemplate.includes("{$}")
  const localUIData = getValue("$")
  const hasOneValue = !isEmpty(localUIData) && !isObject(localUIData)
  if (hasOneToken && hasOneValue) {
    return uriTemplate.replace("{$}", localUIData.toString())
  }

  // Multiple tokens and values
  const matches = uriTemplate && uriTemplate.match(/(\{\$\.([^{]*)\})/gm)
  const replacedUri =
    matches &&
    matches.reduce((acc, match) => {
      const key = match.slice(3, match.length - 1) // Remove leading {$. and trailing }
      const val = getValue(key) || match
      return acc.replace(match, val.toString())
    }, uriTemplate)
  return replacedUri || uriTemplate
}
