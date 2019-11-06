import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const dataDictionaryManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...dataDictionaryManageFormDefinition, ...extend)
}

const dataDictionaryManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Data Dictionary",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
              {
                key: "keyLabel",
                valueKey: "keyLabel",
                label: "Key Label",
                defaultValue: "Key",
                component: "input",
              },
            ],
          },
        ],
      },
    ],
  },
]
