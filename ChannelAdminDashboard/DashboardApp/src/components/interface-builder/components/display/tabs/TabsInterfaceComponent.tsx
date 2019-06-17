import { Tabs } from "antd"
import React from "react"
import { DataPathContext } from "../../../../DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentDefinitionRecursiveProp,
} from "../../base/BaseInterfaceComponent"

export interface TabsInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "tabs"
  defaultActiveKey: string
  tabs?: ComponentDefinition[]
}

export class TabsInterfaceComponent extends BaseInterfaceComponent<TabsInterfaceComponentProps> {
  static getLayoutDefinition() {
    return {
      name: "tabs",
      title: "Tabs",
      icon: "folder",
      componentDefinition: {
        component: "tabs",
      },
    }
  }
  render() {
    const { tabs, defaultActiveKey } = this.props
    return (
      <DataPathContext path="tabs">
        <Tabs defaultActiveKey={defaultActiveKey}>
          {tabs &&
            tabs.map((tab) => (
              <Tabs.TabPane tab={tab.label} key={tab.key}>
                <ComponentRenderer
                  components={
                    (tab as ComponentDefinitionRecursiveProp).components ||
                    ([] as ComponentDefinition[])
                  }
                />
              </Tabs.TabPane>
            ))}
        </Tabs>
      </DataPathContext>
    )
  }
}
