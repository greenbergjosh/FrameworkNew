import { Divider } from "antd"
import { DividerProps } from "antd/lib/divider"
import React from "react"
import { dividerManageForm } from "./divider-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

export interface DividerInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "divider"
  dashed?: boolean
  orientation?: DividerProps["type"]
  text?: string
  textAlignment?: DividerProps["orientation"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
}

export class DividerInterfaceComponent extends BaseInterfaceComponent<DividerInterfaceComponentProps> {
  static defaultProps = {
    defaultValue: 0,
  }

  static getLayoutDefinition(): LayoutDefinition {
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

  render(): JSX.Element {
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
