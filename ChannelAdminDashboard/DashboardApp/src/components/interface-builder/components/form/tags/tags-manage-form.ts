import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { baseSelectDataComponents } from "../_shared/select"


export const selectManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "base",
    components: [
      {
        key: "tabs",
        tabs: [
          {
            key: "data",
            components: [
              ...baseSelectDataComponents,
            ],
          },
        ],
      },
    ],
  },
]

export const tagsManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}
