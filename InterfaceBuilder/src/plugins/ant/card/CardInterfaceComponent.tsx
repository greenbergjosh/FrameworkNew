import { Card } from "antd"
import React from "react"
import { DataPathContext } from "../../../contexts/DataPathContext"
import { ComponentRenderer } from "components/ComponentRenderer/ComponentRenderer"
import { cardManageForm } from "./card-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { set } from "lodash/fp"
import { CardInterfaceComponentProps } from "./types"
import { ComponentDefinition, LayoutDefinition } from "../../../globalTypes"

export class CardInterfaceComponent extends BaseInterfaceComponent<CardInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
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

  render(): JSX.Element {
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
      setRootUserInterfaceData,
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
            setRootData={setRootUserInterfaceData}
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
