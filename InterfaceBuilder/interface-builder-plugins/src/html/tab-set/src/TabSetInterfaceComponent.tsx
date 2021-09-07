import React from "react"
import { tabSetManageForm } from "./tab-set-manage-form"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import {
  EVENTS,
  ITabSetContext,
  TabSetInterfaceComponentDisplayModeState,
  TabSetInterfaceComponentProps,
} from "./types"
import { DisplayMode } from "./components/DisplayMode"
import { EditMode } from "./components/EditMode"
import { isNull } from "lodash/fp"
import { TabSetContext } from "./TabSetContext"
import layoutDefinition from "./layoutDefinition"

export default class TabSetInterfaceComponent extends BaseInterfaceComponent<
  TabSetInterfaceComponentProps,
  TabSetInterfaceComponentDisplayModeState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = tabSetManageForm
  static availableEvents = [EVENTS.ACTIVE_TAB_CHANGED]

  constructor(props: TabSetInterfaceComponentProps) {
    super(props)

    this.state = {
      activeTabKey: undefined,
      availableTabs: [],
      isUserInteracting: false,
    }
  }

  componentDidMount(): void {
    this.setState({ activeTabKey: this.props.defaultActiveTabKey })
  }

  handleAddAvailableTab: ITabSetContext["addAvailableTab"] = (tabKey) => {
    this.setState((prevState) => ({
      availableTabs: [...prevState.availableTabs, tabKey],
    }))
  }

  handleSetActiveTabKey: ITabSetContext["setActiveTabKey"] = (activeTabKey) => {
    if (!isNull(activeTabKey)) {
      this.raiseEvent(EVENTS.ACTIVE_TAB_CHANGED, { activeTabKey })
    }
    this.setState({ activeTabKey })
  }

  handleSetUserInteracting: ITabSetContext["setUserInteracting"] = () => {
    this.setState({ isUserInteracting: true })
  }

  render(): JSX.Element {
    if (this.props.mode === "edit") {
      return (
        <TabSetContext.Provider
          value={{
            activeTabKey: this.state.activeTabKey,
            setActiveTabKey: this.handleSetActiveTabKey,
            availableTabs: this.state.availableTabs,
            addAvailableTab: this.handleAddAvailableTab,
            isUserInteracting: this.state.isUserInteracting,
            setUserInteracting: this.handleSetUserInteracting,
          }}>
          <EditMode
            data={this.props.userInterfaceData}
            defaultActiveTabKey={this.props.defaultActiveTabKey}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            onChangeData={this.props.onChangeData}
            onChangeRootData={this.props.onChangeRootData}
            tabs={this.props.tabs}
          />
        </TabSetContext.Provider>
      )
    }
    return (
      <TabSetContext.Provider
        value={{
          activeTabKey: this.state.activeTabKey,
          setActiveTabKey: this.handleSetActiveTabKey,
          availableTabs: this.state.availableTabs,
          addAvailableTab: this.handleAddAvailableTab,
          isUserInteracting: this.state.isUserInteracting,
          setUserInteracting: this.handleSetUserInteracting,
        }}>
        <DisplayMode
          data={this.props.userInterfaceData}
          defaultActiveTabKey={this.props.defaultActiveTabKey}
          getRootUserInterfaceData={this.props.getRootUserInterfaceData}
          onChangeData={this.props.onChangeData}
          onChangeRootData={this.props.onChangeRootData}
          tabs={this.props.tabs}
        />
      </TabSetContext.Provider>
    )
  }
}
