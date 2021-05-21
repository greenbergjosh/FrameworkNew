import React from "react"
import { iframeManageForm } from "./iframe-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../../globalTypes"

export interface IFrameInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "iframe"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]

  src: string
  height?: number
  bordered?: boolean
}

export class IFrameInterfaceComponent extends BaseInterfaceComponent<IFrameInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Display",
      name: "iframe",
      title: "IFrame",
      icon: "global",
      componentDefinition: {
        component: "iframe",
        components: [],
      },
    }
  }

  static manageForm = iframeManageForm

  /*
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
   * https://www.tutorialrepublic.com/faq/automatically-adjust-iframe-height-according-to-its-contents-using-javascript.php
   */
  render(): JSX.Element {
    const { height, src } = this.props
    return <iframe src={src} height={height} width="100%" style={{ display: "block", border: "none" }} />
  }
}
