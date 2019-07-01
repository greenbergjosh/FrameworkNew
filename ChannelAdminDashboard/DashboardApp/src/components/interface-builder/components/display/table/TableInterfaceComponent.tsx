import React from "react"
import { ComponentRenderer, ComponentRendererModeContext } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { tableDataTypes } from "./table-data-types-form"
import { tableManageForm } from "./table-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

export interface TableInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "table"
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

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
    const { onChangeData, userInterfaceData, valueKey } = this.props
    const dataArray = userInterfaceData[valueKey] || []

    return (
      <ComponentRendererModeContext.Consumer>
        {(mode) => {
          // switch (mode) {
          //   case "edit": {
          const data = { columns: dataArray }

          return (
            <ComponentRenderer
              components={editComponents}
              data={data}
              dragDropDisabled
              onChangeData={(newData) => {
                console.log("TableInterfaceComponent.render", "onChangeData", { data, newData })
                console.log("TableInterfaceComponent.render", "onChangeData2", {
                  userInterfaceData,
                  userInterfaceData2: { ...userInterfaceData, [valueKey]: newData.columns },
                })
                onChangeData && onChangeData({ ...userInterfaceData, [valueKey]: newData.columns })
              }}
            />
          )
          //   }
          //   case "display": {
          //     return <div />
          //   }
          // }
        }}
      </ComponentRendererModeContext.Consumer>
    )
  }
}

const editComponents: ComponentDefinition[] = [
  {
    key: "columns",
    valueKey: "columns",
    addItemLabel: "Add Column",
    component: "list",
    emptyText: "No Configured Columns",
    orientation: "horizontal",
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
            defaultValue: "text",
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
