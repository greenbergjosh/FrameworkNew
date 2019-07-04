import { get, set } from "lodash/fp"
import React from "react"
import { ComponentRenderer, ComponentRendererModeContext } from "../../../ComponentRenderer"
import { EditUserInterfaceProps, UserInterfaceProps } from "../../../UserInterface"
import { tableDataTypes } from "./table-data-types-form"
import { tableManageForm } from "./table-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

interface ITableInterfaceComponentProps extends ComponentDefinitionNamedProps {
  abstract?: boolean
  component: "table"
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

interface TableInterfaceComponentDisplayModeProps extends ITableInterfaceComponentProps {
  mode: "display"
}

interface TableInterfaceComponentEditModeProps extends ITableInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

type TableInterfaceComponentProps =
  | TableInterfaceComponentDisplayModeProps
  | TableInterfaceComponentEditModeProps

export class TableInterfaceComponent extends BaseInterfaceComponent<TableInterfaceComponentProps> {
  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "table",
      title: "Table",
      icon: "table",
      componentDefinition: {
        component: "table",
        columns: [],
      },
    }
  }

  static manageForm = tableManageForm

  render() {
    const { abstract, onChangeData, userInterfaceData, valueKey } = this.props
    const dataArray = get(valueKey, userInterfaceData) || []

    return (
      <ComponentRendererModeContext.Consumer>
        {(mode) => {
          console.log("TableInterfaceComponent.render", { props: this.props, mode })
          const data = { columns: dataArray }
          if (abstract) {
            return (
              <ComponentRenderer
                components={editComponents}
                data={data}
                dragDropDisabled
                onChangeData={(newData) => {
                  // console.log("TableInterfaceComponent.render", "onChangeData", { data, newData })
                  onChangeData && onChangeData(set(valueKey, newData.columns, userInterfaceData))
                }}
              />
            )
          } else {
            switch (this.props.mode) {
              case "edit": {
                const { onChangeSchema, userInterfaceSchema } = this.props
                return (
                  <ComponentRenderer
                    components={editComponents}
                    data={userInterfaceSchema}
                    mode="display"
                    onChangeData={(newData) => {
                      console.log("TableInterfaceComponent.render", "onChangeData", {
                        abstract,
                        mode,
                        data,
                        newData,
                        onChangeSchema,
                        userInterfaceSchema,
                      })
                      onChangeSchema &&
                        userInterfaceSchema &&
                        onChangeSchema(set("columns", newData.columns, userInterfaceSchema))
                    }}
                  />
                )
              }
              case "display": {
                return <div>RENDER TABLE HERE</div>
              }
            }
          }
        }}
      </ComponentRendererModeContext.Consumer>
    )
  }
}

const editComponents: ComponentDefinition[] = [
  {
    key: "columns",
    valueKey: "columns",
    label: "Columns",
    addItemLabel: "Add Column",
    component: "list",
    emptyText: "No Configured Columns",
    orientation: "horizontal",
    preconfigured: true,
    components: [
      {
        key: "column",
        component: "card",
        preconfigured: true,
        size: "small",
        components: [
          {
            key: "header",
            valueKey: "headerText",
            label: "Header",
            component: "input",
          },
          {
            key: "field",
            valueKey: "field",
            label: "Field",
            component: "input",
          },
          {
            key: "type",
            valueKey: "type",
            label: "Type",
            component: "select",
            dataHandlerType: "local",
            data: {
              values: tableDataTypes.map((type) => type.option),
            },
            defaultValue: "string",
          },
          ...tableDataTypes.flatMap((type) =>
            type.form.map((formItem) => ({
              ...formItem,
              visibilityConditions: {
                "===": [
                  type.option.value,
                  {
                    var: ["type"],
                  },
                ],
              },
            }))
          ),
        ],
      },
    ],
  },
]
