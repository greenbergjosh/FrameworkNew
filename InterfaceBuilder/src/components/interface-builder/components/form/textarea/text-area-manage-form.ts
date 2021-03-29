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
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
              },
              {
                key: "maxLength",
                valueKey: "maxLength",
                ordinal: 10,
                component: "number-input",
                defaultValue: null,
                label: "Max length",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "autosize",
                valueKey: "autosize",
                ordinal: 11,
                component: "toggle",
                defaultValue: true,
                label: "Autosize height",
                bindable: true,
              },
              {
                key: "minRows",
                valueKey: "minRows",
                ordinal: 12,
                component: "number-input",
                defaultValue: null,
                label: "Min rows",
                bindable: true,
                visibilityConditions: {
                  "===": [false, { var: "autosize" }],
                },
              },
              {
                key: "maxRows",
                valueKey: "maxRows",
                ordinal: 13,
                component: "number-input",
                defaultValue: null,
                label: "Max rows",
                bindable: true,
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
