import { ComponentDefinition } from "@opg/interface-builder"
import { tableAdvancedForm } from "./table-advanced-form"
import { tableAggregateForm } from "./table-aggregate-form"
import { tableDataTypes } from "./table-data-types-form"
import { tableGroupForm } from "./table-group-form"
import { tableSortForm } from "./table-sort-form"
import { visiblityConditionType } from "../types"

export const editComponents: ComponentDefinition[] = [
  {
    key: "columns",
    valueKey: "columns",
    label: "Columns",
    hideLabel: true,
    addItemLabel: "Add Column",
    component: "list",
    emptyText: "No Configured Columns",
    orientation: "horizontal",
    preconfigured: true,
    getRootUserInterfaceData: () => void 0,
    onChangeRootData: () => void 0,
    incomingEventHandlers: [],
    outgoingEventMap: {},
    components: [
      {
        key: "column",
        component: "container",
        label: "Column",
        hideLabel: true,
        preconfigured: true,
        size: "small",
        style: "&.container { padding: 5px; }",
        components: [
          {
            key: "header",
            valueKey: "headerText",
            label: "Header",
            component: "input",
            size: "small",
          },
          {
            key: "field",
            valueKey: "field",
            label: "Field",
            component: "input",
            size: "small",
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
            size: "small",
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
            sections: [tableSortForm, tableGroupForm, tableAggregateForm, tableAdvancedForm],
          },
        ],
      },
    ],
  },
]
