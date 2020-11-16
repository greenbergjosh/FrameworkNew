import React from "react"
import { repeaterManageForm } from "./repeater-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { RepeaterInterfaceComponentProps } from "./types"
import { ConfigureMode } from "./components/ConfigureMode"
import { DisplayMode } from "./components/DisplayMode"
import { get, set, isEmpty } from "lodash/fp"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

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

  handleChange = (nextState: JSONRecord | JSONRecord[], subpath?: string): void => {
    const { valueKey, userInterfaceData } = this.props
    const path = !isEmpty(subpath) ? `${valueKey}${subpath}` : valueKey
    this.props.onChangeData && this.props.onChangeData(set(path, nextState, userInterfaceData))
  }

  render(): JSX.Element | undefined {
    const {
      addItemLabel,
      components,
      emptyText,
      hasInitialRecord,
      hasLastItemComponents,
      lastItemComponents,
      orientation,
      preconfigured,
      userInterfaceData,
      getRootUserInterfaceData,
      valueKey,
      mode,
    } = this.props
    const data = get(valueKey, userInterfaceData) || []

    switch (mode) {
      case "display": {
        return (
          <DisplayMode
            addItemLabel={addItemLabel}
            components={components}
            data={data}
            getRootUserInterfaceData={getRootUserInterfaceData}
            description={emptyText}
            hasInitialRecord={hasInitialRecord}
            hasLastItemComponents={hasLastItemComponents}
            lastItemComponents={lastItemComponents}
            onChange={this.handleChange}
            orientation={orientation}
          />
        )
      }
      case "edit": {
        // Repeat the component once per item in the repeater
        return (
          <ConfigureMode
            components={components}
            data={data}
            getRootUserInterfaceData={getRootUserInterfaceData}
            hasLastItemComponents={hasLastItemComponents}
            lastItemComponents={lastItemComponents}
            onChange={this.handleChange}
            preconfigured={preconfigured}
          />
        )
      }
    }
  }
}
