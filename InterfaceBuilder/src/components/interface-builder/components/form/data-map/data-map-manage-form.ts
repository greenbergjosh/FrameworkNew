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
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
              },
              {
                key: "multiple",
                valueKey: "multiple",
                label: "Multiple",
                component: "toggle",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
