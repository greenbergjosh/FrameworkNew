import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

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
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
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
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
