import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"
import { TabContent } from "./components/TabContent"
import { TabInterfaceComponentProps } from "./types"
import { settings } from "./settings"
import layoutDefinition from "./layoutDefinition"

export default class TabInterfaceComponent extends BaseInterfaceComponent<TabInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

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
