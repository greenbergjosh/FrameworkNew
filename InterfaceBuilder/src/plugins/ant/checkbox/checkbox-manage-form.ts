import { baseManageForm } from "components/BaseInterfaceComponent/baseManageForm"
import { ComponentDefinition } from "../../../globalTypes"

export const checkboxManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...checkboxManageFormDefinition, ...extend)
}

const checkboxManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Checkbox",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
              },
              {
                key: "indeterminate",
                valueKey: "indeterminate",
                ordinal: 10,
                component: "checkbox",
                label: "Allow indeterminate state",
                defaultValue: false,
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "disabled",
                valueKey: "disabled",
                label: "Read Only",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
