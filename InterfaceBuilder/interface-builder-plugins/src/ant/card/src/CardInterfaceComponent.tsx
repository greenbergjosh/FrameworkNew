import { Card } from "antd"
import React from "react"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentRenderer,
  DataPathContext,
  LayoutDefinition,
} from "@opg/interface-builder"
import { settings } from "./settings"
import { set } from "lodash/fp"
import { CardInterfaceComponentProps } from "./types"
import layoutDefinition from "./layoutDefinition"

export default class CardInterfaceComponent extends BaseInterfaceComponent<CardInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

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
      onChangeRootData,
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
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
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
