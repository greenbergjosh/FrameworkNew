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
              ...baseSelectDataComponents.slice(0, 3),
              {
                key: "multiple",
                valueKey: "multiple",
                label: "Allow Multiple?",
                help: "Allow the user to select multiple items?",
                component: "toggle",
                defaultValue: false,
              },
              ...baseSelectDataComponents.slice(3),
            ],
          },
        ],
      },
    ],
  },
]


export const selectManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}
