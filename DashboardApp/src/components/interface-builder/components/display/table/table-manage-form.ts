import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const tableManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...tableManageFormDefinition, ...extend)
}

const tableManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Table Config",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "columns",
              },
            ],
          },
        ],
      },
    ],
  },
]
