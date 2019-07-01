import { Card } from "antd"
import React from "react"
import { DataPathContext } from "../../../../DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { cardManageForm } from "./card-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

export interface CardInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "card"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]

  bordered?: boolean
  extra?: string
  hoverable?: boolean
  inset?: boolean
  size?: "small" | "default"
  title?: string
}

export class CardInterfaceComponent extends BaseInterfaceComponent<CardInterfaceComponentProps> {
  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "card",
      title: "Card",
      icon: "profile",
      componentDefinition: {
        component: "card",
        components: [],
      },
    }
  }

  static manageForm = cardManageForm

  render() {
    const {
      bordered,
      components,
      extra,
      hoverable,
      inset,
      onChangeData,
      preconfigured,
      size,
      title,
      userInterfaceData,
    } = this.props
    return (
      <Card
        bordered={bordered}
        className={"ui-card"}
        extra={extra}
        hoverable={hoverable}
        size={size}
        title={title}
        type={inset ? "inner" : undefined}>
        <DataPathContext path="components">
          <ComponentRenderer
            components={components || ([] as ComponentDefinition[])}
            data={userInterfaceData}
            dragDropDisabled={!!preconfigured}
            onChangeData={onChangeData}
          />
        </DataPathContext>
      </Card>
    )
  }
}
