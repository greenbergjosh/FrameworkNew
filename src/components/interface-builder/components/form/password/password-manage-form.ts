import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const passwordManageForm = (...extend: Partial<ComponentDefinition>[]) => {
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
            components: [
              {
                key: "label",
                defaultValue: "Input Text",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "hasShowPasswordToggle",
                valueKey: "hasShowPasswordToggle",
                ordinal: 10,
                component: "checkbox",
                defaultValue: false,
                label: "Show Password Toggle",
              },
            ]
          }
        ],
      },
    ],
  },
]
