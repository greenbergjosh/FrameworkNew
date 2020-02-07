import { Divider } from "antd"
import { DividerProps } from "antd/lib/divider"
import { get } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { dividerManageForm } from "./divider-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface DividerInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "divider"
  dashed?: boolean
  orientation?: DividerProps["type"]
  text?: string
  textAlignment?: DividerProps["orientation"]
}

export class DividerInterfaceComponent extends BaseInterfaceComponent<
  DividerInterfaceComponentProps
> {
  static defaultProps = {
    defaultValue: 0,
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "divider",
      title: "Divider",
      icon: "line",
      componentDefinition: {
        component: "divider",
      },
    }
  }

  static manageForm = dividerManageForm

  render() {
    const { dashed, orientation, text, textAlignment } = this.props

    return text ? (
      <Divider dashed={dashed} type={orientation} orientation={textAlignment}>
        {text}
      </Divider>
    ) : (
      <Divider dashed={dashed} type={orientation} orientation={textAlignment} />
    )
  }
}
