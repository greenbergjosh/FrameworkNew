import { get } from "lodash/fp"
import React from "react"
import { v4 as uuid } from "uuid"
import { ComponentRendererModeContext } from "../../../ComponentRenderer"
import { listManageForm } from "./list-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import DisplayMode from "./components/DisplayMode"
import EditMode from "./components/EditMode"
import { ListInterfaceComponentProps } from "./types"

export class ListInterfaceComponent extends BaseInterfaceComponent<ListInterfaceComponentProps> {
  static defaultProps = {
    addItemLabel: "Add Item",
    allowDelete: true,
    allowReorder: true,
    orientation: "vertical",
    interleave: "none",
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

  listId = uuid()

  render() {
    const {
      addItemLabel,
      components,
      emptyText,
      interleave,
      onChangeData,
      orientation,
      preconfigured,
      unwrapped,
      userInterfaceData,
      valueKey,
    } = this.props

    // Get the list data from the data set
    const data = get(valueKey, userInterfaceData) || []
    console.log("ListInterfaceComponent.render", { data })

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
                  listId={this.listId}
                  onChangeData={onChangeData}
                  orientation={orientation}
                  unwrapped={unwrapped}
                  userInterfaceData={userInterfaceData}
                  valueKey={valueKey}
                />
              )
            }
            case "edit": {
              // Repeat the component once per item in the list
              return (
                <EditMode
                  components={components}
                  data={data}
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
