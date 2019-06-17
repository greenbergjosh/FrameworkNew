import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const inputManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...inputManageFormDefinition, ...extend)
}

const inputManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "base",
    components: [
      {
        key: "tabs",
        tabs: [
          {
            key: "data",
            components: [],
          },
        ],
      },
    ],
  },
]
