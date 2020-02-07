import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const numberInputManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...numberInputManageFormDefinition, ...extend)
}

const numberInputManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Number",
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
