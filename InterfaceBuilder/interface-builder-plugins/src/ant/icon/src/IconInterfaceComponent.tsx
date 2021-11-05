import React from "react"
import styled, { css } from "styled-components"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { IconInterfaceComponentProps } from "./types"
import { settings } from "./settings"
import layoutDefinition from "./layoutDefinition"
import { Icon } from "antd"
import { isEmpty } from "lodash/fp"

const Span = styled.span`
  ${({ styleString }: { styleString: string }) => css`
    ${styleString}
  `}
`

export default class IconInterfaceComponent extends BaseInterfaceComponent<IconInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  render(): JSX.Element {
    const iconNameFromInput = !isEmpty(this.props.icon) ? this.props.icon : layoutDefinition.icon
    const iconNameFromModel = !isEmpty(this.props.valueKey) ? this.getValue(this.props.valueKey) : null
    /*
     * 1. Try to obtain icon name from model
     * 2. Try to obtain icon from input
     * 3. Otherwise use default icon
     */
    const iconName = !isEmpty(iconNameFromModel) ? iconNameFromModel : iconNameFromInput

    return (
      <Span styleString={this.props.style} className={"container"}>
        <Icon type={iconName} />
      </Span>
    )
  }
}
