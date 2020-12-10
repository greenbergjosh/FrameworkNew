import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const checkboxManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...checkboxManageFormDefinition, ...extend)
}

const checkboxManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Checkbox",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
              {
                key: "indeterminate",
                valueKey: "indeterminate",
                ordinal: 10,
                component: "checkbox",
                label: "Allow indeterminate state",
                defaultValue: false,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "disabled",
                valueKey: "disabled",
                label: "Read Only",
                component: "toggle",
                defaultValue: false,
              },
            ],
          },
        ],
      },
    ],
  },
]
