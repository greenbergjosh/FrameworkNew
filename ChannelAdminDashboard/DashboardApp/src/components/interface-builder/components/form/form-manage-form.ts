import { baseManageForm } from "../base/base-component-form"
import { ComponentDefinition } from "../base/BaseInterfaceComponent"

export const formManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...formManageFormDefinition, ...extend)
}

const formManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Toggle",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
            ],
          },
        ],
      },
    ],
  },
]
