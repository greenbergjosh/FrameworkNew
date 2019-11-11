import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const filteredMenuManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...filteredMenuManageFormDefinition, ...extend)
}

const filteredMenuManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Menu",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
              },
              {
                key: "menuItemKey",
                valueKey: "menuItemKey",
                component: "input",
                defaultValue: "id",
                label: "Menu Item Key",
              },
              {
                key: "menuItemLabelKey",
                valueKey: "menuItemLabelKey",
                component: "input",
                defaultValue: "label",
                label: "Menu Item Label Key",
              },
            ],
          },
        ],
      },
    ],
  },
]
