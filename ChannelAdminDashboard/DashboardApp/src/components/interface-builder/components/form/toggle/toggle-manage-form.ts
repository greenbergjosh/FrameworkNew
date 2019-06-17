import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const toggleManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...toggleManageFormDefinition, ...extend)
}

const toggleManageFormDefinition: Partial<ComponentDefinition>[] = [
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
            ],
          },
        ],
      },
    ],
  },
]
