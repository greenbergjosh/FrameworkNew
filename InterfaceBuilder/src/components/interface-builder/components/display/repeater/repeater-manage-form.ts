import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const repeaterManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...repeaterManageFormDefinition, ...extend)
}

const repeaterManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Components",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "components",
              },
              {
                key: "addItemLabel",
                valueKey: "addItemLabel",
                component: "input",
                defaultValue: "Add Item",
                label: "'Add' Button Text",
              },
              {
                key: "emptyText",
                valueKey: "emptyText",
                component: "input",
                defaultValue: "No Items",
                label: "Empty Text",
              },
            ],
          },
        ],
      },
    ],
  },
]
