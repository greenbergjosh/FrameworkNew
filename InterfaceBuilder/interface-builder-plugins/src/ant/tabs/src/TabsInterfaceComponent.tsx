import { Tabs } from "antd"
import React from "react"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionRecursiveProp,
  ComponentRenderer,
  DataPathContext,
  LayoutDefinition,
} from "@opg/interface-builder"
import { tabsManageForm } from "./tabs-manage-form"
import { set } from "lodash/fp"
import { EVENTS, TabsInterfaceComponentDisplayModeState, TabsInterfaceComponentProps } from "./types"
import layoutDefinition from "./layoutDefinition"

export default class TabsInterfaceComponent extends BaseInterfaceComponent<
  TabsInterfaceComponentProps,
  TabsInterfaceComponentDisplayModeState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = tabsManageForm
  static availableEvents = [EVENTS.ACTIVE_TAB_CHANGED]

  constructor(props: TabsInterfaceComponentProps) {
    super(props)

    this.state = {
      activeTabKey: null,
    }
  }

  handleTabChange = (activeTabKey: string) => {
    this.raiseEvent(EVENTS.ACTIVE_TAB_CHANGED, { activeTabKey })
    this.setState({ activeTabKey })
  }

  render(): JSX.Element {
    const { onChangeData, tabs, userInterfaceData, getRootUserInterfaceData, onChangeRootData } = this.props
    return (
      <DataPathContext path="tabs">
        <Tabs defaultActiveKey="tab0" onChange={this.handleTabChange}>
          {tabs ? (
            tabs.map((tab, index) => (
              <Tabs.TabPane tab={tab.label} key={`tab${index}`}>
                <DataPathContext path={`${index}.components`}>
                  <ComponentRenderer
                    components={(tab as ComponentDefinitionRecursiveProp).components || ([] as ComponentDefinition[])}
                    data={userInterfaceData}
                    getRootUserInterfaceData={getRootUserInterfaceData}
                    onChangeRootData={onChangeRootData}
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
