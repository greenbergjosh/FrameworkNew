import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const tableManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...tableManageFormDefinition, ...extend)
}

const tableManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "base",
    components: [
      {
        key: "tabs",
        tabs: [
          {
            key: "data",
            components: [
              {
                key: "label",
                defaultValue: "Table Config",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "columns",
              },
              {
                key: "abstract",
                valueKey: "abstract",
                label: "Abstract Component",
                component: "toggle",
                defaultValue: false,
                help:
                  'Marking this component as "Abstract" will force it to be configured in a descendant configuration',
              },
              {
                key: "allowAdding",
                valueKey: "allowAdding",
                label: "Allow Add?",
                help: "Allow the user to create new rows in the table",
                component: "toggle",
                defaultValue: false,
                visibilityConditions: {
                  "===": [
                    false,
                    {
                      var: ["abstract"],
                    },
                  ],
                },
              },
              {
                key: "allowEditing",
                valueKey: "allowEditing",
                label: "Allow Edit?",
                help: "Allow the user to edit rows in the table",
                component: "toggle",
                defaultValue: false,
                visibilityConditions: {
                  "===": [
                    false,
                    {
                      var: ["abstract"],
                    },
                  ],
                },
              },
              {
                key: "allowDeleting",
                valueKey: "allowDeleting",
                label: "Allow Delete?",
                help: "Allow the user to delete rows in the table",
                component: "toggle",
                defaultValue: false,
                visibilityConditions: {
                  "===": [
                    false,
                    {
                      var: ["abstract"],
                    },
                  ],
                },
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "showGroupedColumn",
                valueKey: "showGroupedColumn",
                label: "Default Collapse Groups",
                component: "toggle",
                defaultValue: false,
                help: "Start with all groups collapsed.",
              },
              {
                key: "defaultPageSize",
                valueKey: "defaultPageSize",
                component: "select",
                label: "Default Page Size",
                defaultValue: "50",
                dataHandlerType: "local",
                help: "Default number of rows to show per page.",
                data: {
                  values: [
                    {
                      label: "All",
                      value: "All",
                    },
                    {
                      label: "25",
                      value: "25",
                    },
                    {
                      label: "50",
                      value: "50",
                    },
                    {
                      label: "100",
                      value: "100",
                    },
                    {
                      label: "150",
                      value: "150",
                    },
                    {
                      label: "200",
                      value: "200",
                    },
                    {
                      label: "500",
                      value: "500",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
