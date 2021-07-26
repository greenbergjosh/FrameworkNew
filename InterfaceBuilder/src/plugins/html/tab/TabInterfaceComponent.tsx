import React from "react"
import { tabManageForm } from "./tab-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { TabInterfaceComponentProps } from "./types"
import { LayoutDefinition } from "../../../globalTypes"
import { EditMode } from "./components/EditMode"
import { DisplayMode } from "./components/DisplayMode"
import { TabContent } from "./components/TabContent"

export class TabInterfaceComponent extends BaseInterfaceComponent<TabInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Display",
      name: "tab",
      title: "Tab",
      icon: "folder",
      componentDefinition: {
        component: "tab",
        components: [],
      },
    }
  }

  static manageForm = tabManageForm

  render(): JSX.Element {
    const { onChangeData, userInterfaceData, getRootUserInterfaceData, onChangeRootData } = this.props

    if (this.props.renderSection === "content") {
      return (
        <TabContent
          activeTabKey={this.props.tabKey}
          components={this.props.components}
          data={userInterfaceData}
          disabled={this.props.disabled}
          onChangeData={this.props.onChangeData}
          onChangeRootData={this.props.onChangeRootData}
          onChangeSchema={() => void 0}
          rootUserInterfaceData={this.props.getRootUserInterfaceData}
          tabKey={this.props.tabKey}
          title={this.props.title}
        />
      )
    }
    if (this.props.mode === "edit") {
      return (
        <EditMode
          component={this.props.component}
          componentId={this.componentId}
          components={this.props.components}
          data={userInterfaceData}
          disabled={this.props.disabled}
          getRootUserInterfaceData={getRootUserInterfaceData}
          hidden={this.props.hidden}
          incomingEventHandlers={this.props.incomingEventHandlers}
          invisible={this.props.invisible}
          key={this.props.key}
          onChangeData={onChangeData}
          onChangeRootData={onChangeRootData}
          onChangeSchema={() => void 0}
          outgoingEventMap={this.props.outgoingEventMap}
          tabKey={this.props.tabKey}
          title={this.props.title}
        />
      )
    }
    return (
      <DisplayMode
        component={this.props.component}
        componentId={this.componentId}
        components={this.props.components}
        data={userInterfaceData}
        disabled={this.props.disabled}
        getRootUserInterfaceData={getRootUserInterfaceData}
        hidden={this.props.hidden}
        incomingEventHandlers={this.props.incomingEventHandlers}
        invisible={this.props.invisible}
        key={this.props.key}
        onChangeData={onChangeData}
        onChangeRootData={onChangeRootData}
        onChangeSchema={() => void 0}
        outgoingEventMap={this.props.outgoingEventMap}
        tabKey={this.props.tabKey}
        title={this.props.title}
      />
    )
  }
}
