import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const dataMapManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...dataMapManageFormDefinition, ...extend)
}

const dataMapManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Data Map",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
              {
                key: "multiple",
                valueKey: "multiple",
                label: "Multiple",
                component: "toggle",
              },
            ],
          },
        ],
      },
    ],
  },
]
