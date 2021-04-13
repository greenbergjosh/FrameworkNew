import { Card } from "antd"
import React from "react"
import { DataPathContext } from "../../../util/DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { cardManageForm } from "./card-manage-form"
import { BaseInterfaceComponent, ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { set } from "lodash/fp"
import { CardInterfaceComponentProps } from "components/interface-builder/components/display/card/types"

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
      getRootUserInterfaceData,
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
            getRootData={getRootUserInterfaceData}
            dragDropDisabled={!!preconfigured}
            onChangeData={onChangeData}
            onChangeSchema={(newSchema) => {
              if (this.props.mode === "edit") {
                const { onChangeSchema, userInterfaceSchema } = this.props
                onChangeSchema &&
                  userInterfaceSchema &&
                  onChangeSchema(set("components", newSchema, userInterfaceSchema))
              }
            }}
          />
        </DataPathContext>
      </Card>
    )
  }
}
