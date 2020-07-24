import { ComponentDefinition } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { visiblityConditionType } from "../types"
import { tableDataTypes } from "./table-data-types-form"
import { tableSortForm } from "./table-sort-form"
import { tableGroupForm } from "./table-group-form"
import { tableAggregateForm } from "./table-aggregate-form"
import { tableAdvancedForm } from "./table-advanced-form"

export const editComponents: ComponentDefinition[] = [
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
            visibilityConditions: {
              "!==": [
                "layout",
                {
                  var: "type",
                },
              ],
            },
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
            // @ts-ignore
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
            sections: [tableSortForm, tableGroupForm, tableAggregateForm, tableAdvancedForm],
          },
        ],
      },
    ],
  },
]
