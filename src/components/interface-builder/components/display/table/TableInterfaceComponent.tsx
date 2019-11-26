import { Typography } from "antd"
import { get, set, sortBy } from "lodash/fp"
import React from "react"
import { StandardGrid } from "../../../../grid/StandardGrid"
import { ComponentRenderer, ComponentRendererModeContext } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { DataPathContext } from "../../../util/DataPathContext"
import { tableAdvancedForm } from "./table-column-form-section-advanced"
import { tableAggregateForm } from "./table-column-form-section-aggregate"
import { tableSortForm } from "./table-column-form-section-sort"
import { tableDataTypes } from "./table-data-types-form"
import { tableManageForm } from "./table-manage-form"
import {
  ColumnModel,
  SortDescriptor,
  SortDescriptorModel,
  GroupSettingsModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

interface ColumnSortOptions {
  allowSorting?: boolean
  sortDirection?: "Ascending" | "Descending"
  sortOrder?: number
}

interface ColumnGroupOptions {
  allowGrouping?: boolean
  groupOrder?: number
}

type ColumnConfig = ColumnModel & ColumnSortOptions & ColumnGroupOptions

interface ITableInterfaceComponentProps extends ComponentDefinitionNamedProps {
  abstract?: boolean
  allowAdding?: boolean
  allowDeleting?: boolean
  allowEditing?: boolean
  columns: ColumnConfig[]
  component: "table"
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  rowDetails?: ComponentDefinition[]
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
        rowDetails: [],
      },
    }
  }

  static manageForm = tableManageForm

  render() {
    const {
      abstract,
      allowAdding,
      allowDeleting,
      allowEditing,
      columns,
      onChangeData,
      rowDetails,
      userInterfaceData,
      valueKey,
    } = this.props

    return (
      <ComponentRendererModeContext.Consumer>
        {(mode) => {
          console.log("TableInterfaceComponent.render", { props: this.props, mode })
          const dataArray = get(valueKey, userInterfaceData) || []
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
                onChangeSchema={(newData) => {
                  console.log("TableInterfaceComponent.render", "onChangeSchema X3", {
                    abstract,
                    mode,
                    data,
                    newData,
                  })
                  // onChangeSchema &&
                  //   userInterfaceSchema &&
                  //   onChangeSchema(set("columns", newData.columns, userInterfaceSchema))
                }}
              />
            )
          } else {
            switch (this.props.mode) {
              case "edit": {
                const { onChangeSchema, userInterfaceSchema } = this.props
                return (
                  <>
                    <ComponentRenderer
                      components={editComponents}
                      data={userInterfaceSchema}
                      mode="display"
                      onChangeData={(newData) => {
                        // console.log("TableInterfaceComponent.render", "onChangeData", {
                        //   abstract,
                        //   mode,
                        //   data,
                        //   newData,
                        //   onChangeSchema,
                        //   userInterfaceSchema,
                        // })
                        onChangeSchema &&
                          userInterfaceSchema &&
                          onChangeSchema(set("columns", newData.columns, userInterfaceSchema))
                      }}
                      onChangeSchema={(newData) => {
                        console.log("TableInterfaceComponent.render", "onChangeSchema X1", {
                          abstract,
                          mode,
                          data,
                          newData,
                          onChangeSchema,
                          userInterfaceSchema,
                        })
                        // onChangeSchema &&
                        //   userInterfaceSchema &&
                        //   onChangeSchema(set("columns", newData.columns, userInterfaceSchema))
                      }}
                    />
                    <Typography.Title level={4}>Row Details</Typography.Title>
                    <div style={{ marginLeft: 15 }}>
                      <DataPathContext path="rowDetails">
                        <ComponentRenderer
                          components={rowDetails}
                          data={data}
                          onChangeData={(newData) =>
                            onChangeData && onChangeData(set(valueKey, newData, userInterfaceData))
                          }
                          onChangeSchema={(newSchema) => {
                            // console.log("TableInterfaceComponent.render", "onChangeSchema X2", {
                            //   abstract,
                            //   mode,
                            //   data,
                            //   newSchema,
                            //   onChangeSchema,
                            //   userInterfaceSchema,
                            // })
                            onChangeSchema &&
                              userInterfaceSchema &&
                              onChangeSchema(set("rowDetails", newSchema, userInterfaceSchema))
                          }}
                        />
                      </DataPathContext>
                    </div>
                  </>
                )
              }
              case "display": {
                const dataArray = get(valueKey, userInterfaceData) || [userInterfaceData]
                const sortSettings: SortSettingsModel = {
                  columns: sortBy("sortOrder", columns).reduce(
                    (acc, column) => {
                      if (column.sortDirection && column.field) {
                        acc.push({ field: column.field, direction: column.sortDirection })
                      }
                      return acc
                    },
                    [] as SortDescriptorModel[]
                  ),
                }

                const groupSettings: GroupSettingsModel = {
                  columns: sortBy("groupOrder", columns).reduce(
                    (acc, column) => {
                      if (column.field) {
                        acc.push(column.field)
                      }
                      return acc
                    },
                    [] as string[]
                  ),
                }

                // console.log("TableInterfaceComponent.render", "Display", this.props, {
                //   dataArray,
                //   rowDetails,
                // })
                return (
                  <StandardGrid
                    allowAdding={allowAdding}
                    allowDeleting={allowAdding}
                    allowEditing={allowEditing}
                    columns={columns}
                    contextData={userInterfaceData}
                    data={dataArray}
                    sortSettings={sortSettings}
                    groupSettings={groupSettings}
                    detailTemplate={
                      rowDetails && rowDetails.length
                        ? (parentData: any) => {
                            // console.log("TableInterfaceComponent.render", "Display Child", {
                            //   rowDetails,
                            //   parentData,
                            // })
                            return (
                              <ComponentRenderer
                                components={rowDetails}
                                data={parentData}
                                onChangeData={(newData) =>
                                  onChangeData &&
                                  onChangeData(set(valueKey, newData, userInterfaceData))
                                }
                                onChangeSchema={(newSchema) => {
                                  console.log(
                                    "TableInterfaceComponent.render",
                                    "onChangeSchema X4",
                                    {
                                      abstract,
                                      mode,
                                      data,
                                      newSchema,
                                      // onChangeSchema,
                                      // userInterfaceSchema,
                                    }
                                  )
                                  // onChangeSchema &&
                                  //   userInterfaceSchema &&
                                  //   onChangeSchema(
                                  //     set("rowDetails", newSchema, userInterfaceSchema)
                                  //   )
                                }}
                              />
                            )
                          }
                        : undefined
                    }
                  />
                )
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
              visibilityConditions: formItem.visibilityConditions
                ? {
                    and: [formItem.visibilityConditions, visiblityConditionType(type.option.value)],
                  }
                : visiblityConditionType(type.option.value),
            }))
          ),
          {
            hideLabel: true,
            label: "",
            key: "details",
            valueKey: "",
            component: "collapse",
            sections: [tableSortForm, tableAggregateForm, tableAdvancedForm],
          },
        ],
      },
    ],
  },
]

function visiblityConditionType(type: string) {
  return {
    "===": [
      type,
      {
        var: ["type"],
      },
    ],
  }
}
