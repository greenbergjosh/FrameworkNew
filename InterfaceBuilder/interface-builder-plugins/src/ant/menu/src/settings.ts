import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"
import { baseSelectDataComponents } from "@opg/interface-builder-plugins/lib/ant/shared"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
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
                bindable: true,
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
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
