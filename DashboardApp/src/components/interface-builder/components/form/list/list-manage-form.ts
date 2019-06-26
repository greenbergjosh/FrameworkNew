import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const listManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...listManageFormDefinition, ...extend)
}

const listManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Items",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "items",
              },
              {
                key: "addItemLabel",
                valueKey: "addItemLabel",
                component: "input",
                defaultValue: "Add Item",
                label: "'Add' Button Text",
              },
            ],
          },
        ],
      },
    ],
  },
]
