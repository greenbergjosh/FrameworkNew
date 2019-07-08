import { Tabs } from "antd"
import React from "react"
import { DataPathContext } from "../../../../DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { tabsManageForm } from "./tabs-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentDefinitionRecursiveProp,
} from "../../base/BaseInterfaceComponent"

export interface TabsInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "tabs"
  defaultActiveKey: string
  onChangeData: UserInterfaceProps["onChangeData"]
  tabs?: ComponentDefinition[]
  userInterfaceData?: UserInterfaceProps["data"]
}

export class TabsInterfaceComponent extends BaseInterfaceComponent<TabsInterfaceComponentProps> {
  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "tabs",
      title: "Tabs",
      icon: "folder",
      componentDefinition: {
        component: "tabs",
      },
    }
  }

  static manageForm = tabsManageForm

  render() {
    const { defaultActiveKey, onChangeData, tabs, userInterfaceData } = this.props
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
                  data={userInterfaceData}
                  onChangeData={onChangeData}
                  onChangeSchema={(newSchema) => {
                    console.warn(
                      "TabsInterfaceComponent.render",
                      "TODO: Cannot alter schema inside ComponentRenderer in Tabs",
                      { newSchema }
                    )
                  }}
                />
              </Tabs.TabPane>
            ))}
        </Tabs>
      </DataPathContext>
    )
  }
}
