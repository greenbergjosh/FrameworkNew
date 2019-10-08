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
        ],
      },
    ],
  },
]