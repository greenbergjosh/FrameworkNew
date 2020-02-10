import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { baseSelectDataComponents } from "../../_shared/selectable"


export const selectManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "base",
    components: [
      {
        key: "tabs",
        tabs: [
          {
            key: "data",
            components: [
              ...baseSelectDataComponents,
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "placeholder",
                valueKey: "placeholder",
                label: "Placeholder",
                help: "The greyed out text to appear in the box when no item is selected",
                component: "input",
                defaultValue: null,
              },
              {
                key: "allowClear",
                valueKey: "allowClear",
                label: "Allow Clear",
                help: "Allow the user to clear the selection.",
                component: "toggle",
                defaultValue: true,
              },
            ]
          }
        ],
      },
    ],
  },
]

export const tagsManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}
