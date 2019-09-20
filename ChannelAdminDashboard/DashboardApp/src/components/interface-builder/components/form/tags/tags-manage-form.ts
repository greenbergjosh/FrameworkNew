import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { baseSelectDataComponents } from "../_shared/select"

// maxTagCount: Max tag count to show
// maxTagTextLength: Max tag count to show
// maxTagPlaceholder: Placeholder for not showing tags

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
              {
                key: "maxTagCount",
                valueKey: "maxTagCount",
                label: "Max tag count to show",
                help: "Max tag count to show",
                component: "number-input",
                defaultValue: null,
              },
              {
                key: "maxTagTextLength",
                valueKey: "maxTagTextLength",
                label: "Max tag count to show",
                help: "Max tag count to show",
                component: "number-input",
                defaultValue: null,
              },
              {
                key: "maxTagPlaceholder",
                valueKey: "maxTagPlaceholder",
                label: "Placeholder for not showing tags",
                help: "Placeholder for not showing tags",
                component: "number-input",
                defaultValue: null,
              }
            ],
          },
        ],
      },
    ],
  },
]

export const tagsManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}
