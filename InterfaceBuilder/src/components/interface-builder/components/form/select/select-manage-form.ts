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
              ...baseSelectDataComponents.slice(0, 3), //TODO: Change when sorting by ordinal is implemented
              {
                key: "multiple",
                valueKey: "multiple",
                label: "Allow Multiple",
                help: "Allow the user to select multiple items.",
                component: "toggle",
                defaultValue: false,
              },
              ...baseSelectDataComponents.slice(3), //TODO: Remove when sorting by ordinal is implemented
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

export const selectManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}
