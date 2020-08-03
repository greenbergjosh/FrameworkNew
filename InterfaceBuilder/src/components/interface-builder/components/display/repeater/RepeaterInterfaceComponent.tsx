import React from "react"
import { ComponentRendererModeContext } from "../../../ComponentRenderer"
import { repeaterManageForm } from "./repeater-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { RepeaterInterfaceComponentProps } from "./types"
import { ConfigureMode } from "./components/ConfigureMode"
import { DisplayMode } from "./components/DisplayMode"

export class RepeaterInterfaceComponent extends BaseInterfaceComponent<RepeaterInterfaceComponentProps> {
  static defaultProps = {
    addItemLabel: "Add Item",
    allowDelete: true,
    allowReorder: true,
    orientation: "vertical",
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "repeater",
      title: "Repeater",
      icon: "unordered-list",
      componentDefinition: {
        component: "repeater",
        components: [],
      },
    }
  }

  static manageForm = repeaterManageForm

  render() {
    const {
      addItemLabel,
      components,
      emptyText,
      hasInitialRecord,
      hasLastItemComponents,
      lastItemComponents,
      onChangeData,
      orientation,
      preconfigured,
      userInterfaceData,
      valueKey,
    } = this.props

    return (
      <ComponentRendererModeContext.Consumer>
        {(mode) => {
          switch (mode) {
            case "display": {
              return (
                <DisplayMode
                  addItemLabel={addItemLabel}
                  components={components}
                  description={emptyText}
                  hasInitialRecord={hasInitialRecord}
                  hasLastItemComponents={hasLastItemComponents}
                  lastItemComponents={lastItemComponents}
                  onChangeData={onChangeData}
                  orientation={orientation}
                  userInterfaceData={userInterfaceData}
                  valueKey={valueKey}
                />
              )
            }
            case "edit": {
              // Repeat the component once per item in the repeater
              return (
                <ConfigureMode
                  components={components}
                  hasLastItemComponents={hasLastItemComponents}
                  lastItemComponents={lastItemComponents}
                  onChangeData={onChangeData}
                  preconfigured={preconfigured}
                  userInterfaceData={userInterfaceData}
                  valueKey={valueKey}
                />
              )
            }
          }
        }}
      </ComponentRendererModeContext.Consumer>
    )
  }
}
