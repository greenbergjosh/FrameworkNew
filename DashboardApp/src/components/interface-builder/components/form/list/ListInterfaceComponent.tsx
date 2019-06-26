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
  items: [ComponentDefinition]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export class ListInterfaceComponent extends BaseInterfaceComponent<ListInterfaceComponentProps> {
  static defaultProps = {
    addItemLabel: "Add Item",
    userInterfaceData: {},
    valueKey: "items",
  }

  static getLayoutDefinition() {
    return {
      name: "list",
      title: "List",
      formControl: true,
      icon: "unordered-list",
      componentDefinition: {
        component: "list",
        items: [],
      },
    }
  }

  static manageForm = listManageForm

  render() {
    const { addItemLabel, items, onChangeData, userInterfaceData, valueKey } = this.props
    // Get the list data from the data set
    const data = userInterfaceData[valueKey] || []
    return (
      <div>
        <ComponentRendererModeContext.Consumer>
          {(mode) => {
            switch (mode) {
              case "display": {
                const repeatedComponentDefinition = (items && items[0]) || {}
                const components = (data.map(() => ({ ...repeatedComponentDefinition })) ||
                  []) as ComponentDefinition[]

                return (
                  <>
                    {components.length ? (
                      components.map((iteratedComponent, index) => (
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

                    <Button
                      style={{ display: "block" }}
                      onClick={() =>
                        onChangeData &&
                        onChangeData({ ...userInterfaceData, [valueKey]: [...data, {}] })
                      }>
                      {addItemLabel}
                    </Button>
                  </>
                )
              }
              case "edit": {
                // Repeat the component once per item in the list
                return (
                  <DataPathContext path="items">
                    <ComponentRenderer
                      components={items}
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
