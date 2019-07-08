import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const columnManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...columnManageFormDefinition, ...extend)
}

const columnManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Columns",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "columns",
                hidden: true,
              },
              {
                key: "columnCount",
                valueKey: "columnCount",
                component: "number-input",
                label: "Columns",
                defaultValue: 3,
              },
            ],
          },
        ],
      },
    ],
  },
]
