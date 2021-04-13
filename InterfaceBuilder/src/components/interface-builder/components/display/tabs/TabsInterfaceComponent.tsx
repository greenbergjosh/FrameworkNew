import { Tabs } from "antd"
import React from "react"
import { DataPathContext } from "../../../util/DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { tabsManageForm } from "./tabs-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionRecursiveProp,
} from "../../base/BaseInterfaceComponent"
import { set } from "lodash/fp"
import { TabsInterfaceComponentProps } from "components/interface-builder/components/display/tabs/types"

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
