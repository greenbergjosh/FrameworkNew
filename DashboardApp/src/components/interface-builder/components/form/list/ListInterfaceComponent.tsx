import {
  Alert,
  Button,
  Empty,
  Tabs
  } from "antd"
import { set } from "lodash/fp"
import React from "react"
import { DataPathContext } from "../../../../DataPathContext"
import { ComponentRenderer, ComponentRendererModeContext } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { listManageForm } from "./list-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface ListInterfaceComponentProps extends ComponentDefinitionNamedProps {
  addItemLabel: string
  component: "list"
  /** Interleave:
   * As a list component, this describes in what manner to repeat, if there are multiple components.
   * "none" - There can only be a single component, it alone is repeated every time. (Default)
   * "round-robin" - Every component in the list is rotated through with each addition.
   * "set" - The entire set of components is repeated with each iteration.
   */
  interleave?: "none" | "round-robin" | "set"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export class ListInterfaceComponent extends BaseInterfaceComponent<ListInterfaceComponentProps> {
  static defaultProps = {
    addItemLabel: "Add Item",
    interleave: "none",
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

  handleAddClick = () => {
    const { components, interleave, onChangeData, userInterfaceData, valueKey } = this.props
    const entriesToAdd = interleave === "set" ? components.map(() => ({})) : [{}]
    onChangeData &&
      onChangeData({
        ...userInterfaceData,
        [valueKey]: [...(userInterfaceData[valueKey] || []), ...entriesToAdd],
      })
  }

  render() {
    const {
      addItemLabel,
      components,
      interleave,
      onChangeData,
      userInterfaceData,
      valueKey,
    } = this.props

    // Get the list data from the data set
    const data = userInterfaceData[valueKey] || []
    return (
      <div>
        <ComponentRendererModeContext.Consumer>
          {(mode) => {
            switch (mode) {
              case "display": {
                const finalComponents = repeatedInterleave(interleave, components, data.length)

                console.log("ListInterfaceComponent.render", { data })
                return (
                  <>
                    {finalComponents.length ? (
                      finalComponents.map((iteratedComponent, index) => (
                        <ComponentRenderer
                          key={index}
                          components={[iteratedComponent]}
                          componentLimit={1}
                          data={data[index]}
                          onChangeData={(newData) =>
                            (console.log("ListInterfaceComponent.render", "onChangeData", {
                              data,
                              newData,
                            }),
                            0) ||
                            (onChangeData &&
                              onChangeData(set([valueKey, index], newData, userInterfaceData)))
                          }
                        />
                      ))
                    ) : (
                      <Empty />
                    )}

                    <Button style={{ display: "block" }} onClick={this.handleAddClick}>
                      {addItemLabel}
                    </Button>
                  </>
                )
              }
              case "edit": {
                // Repeat the component once per item in the list
                return (
                  <DataPathContext path="components">
                    <ComponentRenderer
                      components={components}
                      componentLimit={1}
                      data={data}
                      onChangeData={(newData) =>
                        onChangeData && onChangeData({ ...userInterfaceData, [valueKey]: newData })
                      }
                    />
                  </DataPathContext>
                )
              }
            }
          }}
        </ComponentRendererModeContext.Consumer>
        {/* <Alert message="List Data" description={JSON.stringify(userInterfaceData)} type="warning" /> */}
      </div>
    )
  }
}

function repeatedInterleave(
  interleave: ListInterfaceComponentProps["interleave"],
  items: any[],
  count: number
): ComponentDefinition[] {
  switch (interleave) {
    case "none": {
      const singleItem = items[0]
      return [...Array(count)].map(() => ({ ...singleItem }))
    }
    case "round-robin": {
      return [...Array(count)].map((_, index) => ({ ...items[index % items.length] }))
    }
    case "set": {
      const realCount = Math.ceil(count / (items.length || 1)) * items.length
      return [...Array(realCount)].map((_, index) => ({ ...items[index % items.length] }))
    }
    default: {
      return []
    }
  }
}
