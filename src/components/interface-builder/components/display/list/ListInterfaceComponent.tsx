import { Button, Empty } from "antd"
import classNames from "classnames"
import { get, set } from "lodash/fp"
import React from "react"
import { ComponentRenderer, ComponentRendererModeContext } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { DataPathContext } from "../../../util/DataPathContext"
import { listManageForm } from "./list-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  getDefaultsFromComponentDefinitions,
} from "../../base/BaseInterfaceComponent"

export interface ListInterfaceComponentProps extends ComponentDefinitionNamedProps {
  addItemLabel: string
  allowDelete: boolean
  allowReorder: boolean
  component: "list"
  emptyText?: string
  orientation?: "horizontal" | "vertical"
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
  preconfigured?: boolean
  unwrapped?: boolean
}

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

  handleAddClick = () => {
    const {
      components,
      interleave,
      onChangeData,
      unwrapped,
      userInterfaceData,
      valueKey,
    } = this.props
    const entriesToAdd =
      interleave === "set"
        ? components.map((component, index) => getDefaultsFromComponentDefinitions([component]))
        : interleave === "none"
        ? [getDefaultsFromComponentDefinitions([components[0]])]
        : interleave === "round-robin"
        ? [
            getDefaultsFromComponentDefinitions([
              components[(get(valueKey, userInterfaceData) || []) % components.length],
            ]),
          ]
        : []
    onChangeData &&
      onChangeData(
        set(
          valueKey,
          [
            ...(get(valueKey, userInterfaceData) || []),
            ...(unwrapped ? entriesToAdd.map((entry) => Object.values(entry)[0]) : entriesToAdd),
          ],
          userInterfaceData
        )
      )
  }

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
    return (
      <ComponentRendererModeContext.Consumer>
        {(mode) => {
          switch (mode) {
            case "display": {
              const finalComponents = repeatedInterleave(interleave, components, data.length)

              console.log("ListInterfaceComponent.render", { data })
              return (
                <>
                  <div
                    className={classNames("ui-list", {
                      "ui-list-horizontal": orientation === "horizontal",
                      "ui-list-vertical": orientation === "vertical",
                    })}>
                    {finalComponents.length ? (
                      <>
                        {finalComponents.map((iteratedComponent, index) => (
                          <ComponentRenderer
                            key={index}
                            components={[iteratedComponent]}
                            componentLimit={interleave === "none" ? 1 : 0}
                            data={
                              data[index]
                                ? unwrapped
                                  ? {
                                      // @ts-ignore
                                      [iteratedComponent.valueKey]: data[index],
                                    }
                                  : data[index]
                                : {}
                            }
                            onChangeData={(newData) =>
                              (console.log("ListInterfaceComponent.render", "onChangeData", {
                                data,
                                newData,
                              }),
                              0) ||
                              (onChangeData &&
                                onChangeData(
                                  set(
                                    `${valueKey}.${index}`,
                                    unwrapped ? Object.values(newData)[0] : newData,
                                    userInterfaceData
                                  )
                                ))
                            }
                            onChangeSchema={(newSchema) => {
                              console.warn(
                                "ListInterfaceComponent.render",
                                "TODO: Cannot alter schema inside ComponentRenderer in List.",
                                { newSchema }
                              )
                            }}
                          />
                        ))}
                        <br />
                        <ComponentRenderer
                          components={finalComponents}
                          componentLimit={interleave === "none" ? 1 : 0}
                          data={data.map((item: any, index: number) =>
                            item
                              ? unwrapped
                                ? {
                                    // @ts-ignore (valueKey doesn't technically exist on the props)
                                    [finalComponents[index].valueKey]: item,
                                  }
                                : item
                              : {}
                          )}
                          onChangeData={(newData) =>
                            (console.log("ListInterfaceComponent.render", "onChangeData", {
                              data,
                              newData,
                            }),
                            0) ||
                            (onChangeData &&
                              onChangeData(
                                set(
                                  valueKey,
                                  unwrapped
                                    ? newData.map((item: any) => Object.values(item)[0])
                                    : newData,
                                  userInterfaceData
                                )
                              ))
                          }
                          onChangeSchema={(newSchema) => {
                            console.warn(
                              "ListInterfaceComponent.render",
                              "TODO: Cannot alter schema inside ComponentRenderer in List.",
                              { newSchema }
                            )
                          }}
                        />
                      </>
                    ) : (
                      <Empty description={emptyText} />
                    )}
                  </div>
                  <Button
                    style={{ display: "block", marginTop: "10px", marginBottom: "10px" }}
                    onClick={this.handleAddClick}>
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
                    componentLimit={interleave === "none" ? 1 : 0}
                    data={data}
                    dragDropDisabled={!!preconfigured}
                    onChangeData={(newData) =>
                      onChangeData && onChangeData(set(valueKey, newData, userInterfaceData))
                    }
                    onChangeSchema={(newSchema) => {
                      console.warn(
                        "ListInterfaceComponent.render",
                        "TODO: Cannot alter schema inside ComponentRenderer in List",
                        { newSchema }
                      )
                    }}
                  />
                </DataPathContext>
              )
            }
          }
        }}
      </ComponentRendererModeContext.Consumer>
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
