import { baseManageForm } from "components/BaseInterfaceComponent/baseManageForm"
import { baseSelectDataComponents } from "../_shared/selectable/selectable-manage-form"
import { ComponentDefinition } from "../../../globalTypes"

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
