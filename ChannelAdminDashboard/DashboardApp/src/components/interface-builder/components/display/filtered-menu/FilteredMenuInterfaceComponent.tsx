import React from "react"
import { get, set } from "lodash/fp"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { DataPathContext } from "../../../../DataPathContext"
import { FilteredMenu } from "../../../../filtered-menu/FilteredMenu"
import { filteredMenuManageForm } from "./filtered-menu-manage-form"
import { JSONRecord } from "../../../../../data/JSON"
import { UserInterfaceProps } from "../../../UserInterface"

export interface FilteredMenuInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "filtered-menu"
  valueKey: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  menuItemKey: string
  menuItemLabelKey: string
}

export class FilteredMenuInterfaceComponent extends BaseInterfaceComponent<FilteredMenuInterfaceComponentProps> {
  static defaultProps = {
    defaultValue: [],
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "filtered-menu",
      title: "Menu",
      icon: "menu",
      componentDefinition: {
        component: "filtered-menu",
      },
    }
  }

  static manageForm = filteredMenuManageForm

  selectHandler = (currentSelection: JSONRecord | null | undefined) => {
    const { onChangeData, userInterfaceData, menuItemKey } = this.props
    const selected = get("selected", userInterfaceData)
    // Deselect if user clicked on selected again
    let newSelectedItem: JSONRecord | null | undefined
    const currentId = currentSelection && currentSelection[menuItemKey]
    const previousId = selected && selected[menuItemKey]
    console.log("currentId, previousId", currentId, previousId)
    if (currentId !== previousId) {
      newSelectedItem = currentSelection
    }
    console.log("this.selected", selected)
    onChangeData && onChangeData(set("selected", newSelectedItem, userInterfaceData))
  }

  render() {
    const { defaultValue, userInterfaceData, valueKey, menuItemKey, menuItemLabelKey } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    const selected = get("selected", userInterfaceData)
    const mockData = [
      {
        id: "one",
        label: "Oneders",
      },
      {
        id: "two",
        label: "Two",
      },
      {
        id: "twofus",
        label: "Twofus",
      },
      {
        id: "three",
        label: "Three",
      },
    ]

    return (
      <FilteredMenu
        data={mockData}
        valueAccessor={menuItemKey}
        labelAccessor={menuItemLabelKey}
        onSelect={this.selectHandler}
        selected={selected}
      />
    )
  }
}
