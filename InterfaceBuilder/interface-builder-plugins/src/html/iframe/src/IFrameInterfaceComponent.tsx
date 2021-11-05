import React from "react"
import { settings } from "./settings"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "@opg/interface-builder"
import layoutDefinition from "./layoutDefinition"

export interface IFrameInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "iframe"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]

  src: string
  height?: number
  bordered?: boolean
}

export default class IFrameInterfaceComponent extends BaseInterfaceComponent<IFrameInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  /*
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
   * https://www.tutorialrepublic.com/faq/automatically-adjust-iframe-height-according-to-its-contents-using-javascript.php
   */
  render(): JSX.Element {
    const { height, src } = this.props
    return <iframe src={src} height={height} width="100%" style={{ display: "block", border: "none" }} />
  }
}
