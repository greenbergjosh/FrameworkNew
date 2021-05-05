import { get } from "lodash/fp"
import React from "react"
import { v4 as uuid } from "uuid"
import { listManageForm } from "./list-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import DisplayMode from "./components/DisplayMode"
import EditMode from "./components/EditMode"
import { ListInterfaceComponentProps } from "./types"
import { ComponentRendererModeContext } from "../../../contexts/ComponentRendererModeContext"
import { LayoutDefinition } from "../../../globalTypes"

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

  static getLayoutDefinition(): LayoutDefinition {
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

  render(): JSX.Element {
    const {
      addItemLabel,
      components,
      emptyText,
      interleave,
      orientation,
      preconfigured,
      unwrapped,
      userInterfaceData,
      getRootUserInterfaceData,
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
                  getRootUserInterfaceData={getRootUserInterfaceData}
                  getValue={this.getValue.bind(this)}
                  setValue={this.setValue.bind(this)}
                  description={emptyText}
                  interleave={interleave}
                  listId={this.listId}
                  orientation={orientation}
                  unwrapped={unwrapped}
                  userInterfaceData={userInterfaceData}
                  valueKey={valueKey}
                />
              )
            }
            case "preview": {
              return (
                <DisplayMode
                  addItemLabel={addItemLabel}
                  components={components}
                  data={[]}
                  getRootUserInterfaceData={() => null}
                  getValue={() => null}
                  setValue={() => null}
                  description={emptyText}
                  interleave={interleave}
                  listId={this.listId}
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
                  getRootUserInterfaceData={getRootUserInterfaceData}
                  getValue={this.getValue.bind(this)}
                  setValue={this.setValue.bind(this)}
                  interleave={interleave}
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
