import { baseManageForm } from "components/BaseInterfaceComponent/baseManageForm"
import { ComponentDefinition } from "../../../globalTypes"

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
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
              },
              {
                key: "keyLabel",
                valueKey: "keyLabel",
                label: "Key Label",
                defaultValue: "Key",
                component: "input",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
