import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const textAreaManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...textAreaManageFormDefinition, ...extend)
}

const textAreaManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Text Area",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
              {
                key: "autosize",
                valueKey: "autosize",
                ordinal: 10,
                component: "toggle",
                defaultValue: true,
                label: "Autosize height"
              },
              {
                key: "minRows",
                valueKey: "minRows",
                ordinal: 11,
                component: "number-input",
                defaultValue: null,
                label: "Min rows",
                visibilityConditions: {
                  "===": [false, { var: "autosize" }],
                },
              },
              {
                key: "maxRows",
                valueKey: "maxRows",
                ordinal: 11,
                component: "number-input",
                defaultValue: null,
                label: "Max rows",
                visibilityConditions: {
                  "===": [false, { var: "autosize" }],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
