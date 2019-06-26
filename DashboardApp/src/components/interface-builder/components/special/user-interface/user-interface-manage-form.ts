import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const userInterfaceManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...userInterfaceManageFormDefinition, ...extend)
}

const userInterfaceManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Layout Creator",
              },
              {
                key: "valueKey",
                defaultValue: "layout",
              },
            ],
          },
        ],
      },
    ],
  },
]
