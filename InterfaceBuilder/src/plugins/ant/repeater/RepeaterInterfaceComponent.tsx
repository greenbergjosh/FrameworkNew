import React from "react"
import { repeaterManageForm } from "./repeater-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { RepeaterInterfaceComponentProps } from "./types"
import { ConfigureMode } from "./components/ConfigureMode"
import { DisplayMode } from "./components/DisplayMode"
import { isEmpty } from "lodash/fp"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { LayoutDefinition } from "../../../globalTypes"

export class RepeaterInterfaceComponent extends BaseInterfaceComponent<RepeaterInterfaceComponentProps> {
  static defaultProps = {
    addItemLabel: "Add Item",
    allowDelete: true,
    allowReorder: true,
    orientation: "vertical",
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition(): LayoutDefinition {
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
    this.setValue([path, nextState, userInterfaceData])
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
      getRootUserInterfaceData,
      onChangeRootData,
      valueKey,
      mode,
      readonly,
    } = this.props
    const data = this.getValue(valueKey) || []

    switch (mode) {
      case "display": {
        return (
          <DisplayMode
            addItemLabel={addItemLabel}
            components={components}
            data={data}
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
            description={emptyText}
            hasInitialRecord={hasInitialRecord}
            hasLastItemComponents={hasLastItemComponents}
            lastItemComponents={lastItemComponents}
            onChange={this.handleChange}
            orientation={orientation}
            readonly={readonly}
          />
        )
      }
      case "preview": {
        return (
          <DisplayMode
            addItemLabel={addItemLabel}
            components={components}
            data={[]}
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
            description={emptyText}
            hasInitialRecord={hasInitialRecord}
            hasLastItemComponents={hasLastItemComponents}
            lastItemComponents={lastItemComponents}
            onChange={() => void 0}
            orientation={orientation}
            readonly={readonly}
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
            onChangeRootData={onChangeRootData}
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
