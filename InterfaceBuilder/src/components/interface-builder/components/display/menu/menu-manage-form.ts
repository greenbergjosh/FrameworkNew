import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { baseSelectDataComponents } from "../../_shared/selectable"

export const menuManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...menuManageFormDefinition, ...extend)
}

export const menuManageFormDefinition: Partial<ComponentDefinition>[] = [
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
              {
                key: "resultLimit",
                valueKey: "resultLimit",
                label: "Result Limit",
                ordinal: 9,
                help: "Limit the number of results to display",
                component: "number-input",
                defaultValue: 15,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "searchPlaceholder",
                valueKey: "searchPlaceholder",
                label: "Search Placeholder",
                help: "The greyed out text to appear in the search field when no text is entered",
                component: "input",
                defaultValue: "Search...",
              },
            ],
          },
        ],
      },
    ],
  },
]
