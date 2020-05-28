import { get } from "lodash/fp"
import React from "react"
import { ComponentRendererModeContext } from "../../../ComponentRenderer"
import { listManageForm } from "./list-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { ListInterfaceComponentProps } from "./types"
import { EditMode } from "./components/EditMode"
import { DisplayMode } from "./components/DisplayMode"

export class ListInterfaceComponent extends BaseInterfaceComponent<ListInterfaceComponentProps> {
  static defaultProps = {
    addItemLabel: "Add Item",
    allowDelete: true,
    allowReorder: true,
    orientation: "vertical",
    interleave: "none",
    unwrappedList: false,
    unwrapped: false,
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "list",
      title: "List",
      icon: "unordered-list",
      componentDefinition: {
        component: "list",
        components: [],
      },
    }
  }

  static manageForm = listManageForm

  render() {
    const {
      addItemLabel,
      components,
      emptyText,
      interleave,
      onChangeData,
      orientation,
      preconfigured,
      unwrappedList,
      unwrapped,
      userInterfaceData,
      valueKey,
    } = this.props

    // Get the list data from the data set
    const data = get(valueKey, userInterfaceData) || []

    return (
      <ComponentRendererModeContext.Consumer>
        {(mode) => {
          switch (mode) {
            case "display": {
              return (
                <DisplayMode
                  addItemLabel={addItemLabel}
                  components={components}
                  data={data}
                  description={emptyText}
                  interleave={interleave}
                  onChangeData={onChangeData}
                  orientation={orientation}
                  unwrapped={unwrapped}
                  unwrappedList={unwrappedList}
                  userInterfaceData={userInterfaceData}
                  valueKey={valueKey}
                />
              )
            }
            case "edit": {
              // Repeat the component once per item in the list
              return (
                <EditMode
                  data={data}
                  components={components}
                  interleave={interleave}
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
