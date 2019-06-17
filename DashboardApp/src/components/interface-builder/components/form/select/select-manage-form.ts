import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const selectManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}

const selectManageFormDefinition: Partial<ComponentDefinition>[] = [
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
