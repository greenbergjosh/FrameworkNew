import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const devToolsManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...devToolsManageFormDefinition, ...extend)
}

export const devToolsManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Dev Tools",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
              },
            ],
          },
          {
            key: "appearance",
            components: [],
          },
        ],
      },
    ],
  },
]
