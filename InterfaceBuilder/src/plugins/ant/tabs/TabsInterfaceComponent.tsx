import { Tabs } from "antd"
import React from "react"
import { DataPathContext } from "../../../contexts/DataPathContext"
import { ComponentRenderer } from "components/ComponentRenderer/ComponentRenderer"
import { tabsManageForm } from "./tabs-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { set } from "lodash/fp"
import { TabsInterfaceComponentProps } from "../../../plugins/ant/tabs/types"
import { ComponentDefinition, ComponentDefinitionRecursiveProp, LayoutDefinition } from "../../../globalTypes"

export class TabsInterfaceComponent extends BaseInterfaceComponent<TabsInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
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

  render(): JSX.Element {
    const { defaultActiveKey, onChangeData, tabs, userInterfaceData, getRootUserInterfaceData } = this.props
    return (
      <DataPathContext path="tabs">
        <Tabs defaultActiveKey="tab0">
          {tabs ? (
            tabs.map((tab, index) => (
              <Tabs.TabPane tab={tab.label} key={`tab${index}`}>
                <DataPathContext path={`${index}.components`}>
                  <ComponentRenderer
                    components={(tab as ComponentDefinitionRecursiveProp).components || ([] as ComponentDefinition[])}
                    data={userInterfaceData}
                    getRootData={getRootUserInterfaceData}
                    onChangeData={onChangeData}
                    onChangeSchema={(newSchema) => {
                      if (this.props.mode === "edit") {
                        const { onChangeSchema, userInterfaceSchema } = this.props
                        onChangeSchema &&
                          userInterfaceSchema &&
                          onChangeSchema(set(`tabs.${index}.components`, newSchema, userInterfaceSchema))
                      }
                    }}
                  />
                </DataPathContext>
              </Tabs.TabPane>
            ))
          ) : (
            <Tabs.TabPane tab="" key="tab0"></Tabs.TabPane>
          )}
        </Tabs>
      </DataPathContext>
    )
  }
}
