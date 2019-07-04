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
                visibilityConditions: {
                  "===": [true, { var: "abstract" }],
                },
              },
              {
                key: "abstract",
                valueKey: "abstract",
                label: "Abstract Component",
                component: "toggle",
                defaultValue: false,
                help:
                  'Mark this component as "Abstract" which will force it to be configured in a child screen',
              },
            ],
          },
        ],
      },
    ],
  },
]
