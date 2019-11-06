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
                key: "columns",
                valueKey: "columns",
                component: "list",
                orientation: "horizontal",
                components: [
                  {
                    component: "form",
                    label: "",
                    hideLabel: true,
                    components: [
                      {
                        key: "title",
                        valueKey: "title",
                        component: "input",
                        label: "Title",
                        visibilityConditions: {
                          "===": [false, { var: "hideTitle" }],
                        },
                      },
                      {
                        key: "hideTitle",
                        valueKey: "hideTitle",
                        component: "toggle",
                        label: "Hide Title",
                        defaultValue: false,
                      },
                      {
                        key: "span",
                        valueKey: "span",
                        component: "number-input",
                        label: "Column Width",
                        help:
                          "All column widths combined should add up to 24. Blank widths will be spread across any remaining space.",
                      },
                      {
                        key: "components",
                        valueKey: "components",
                        component: "list",
                        defaultValue: [],
                        hidden: true,
                      },
                    ],
                  },
                ],
                label: "Columns",
                addItemLabel: "Add Column",
                emptyText: "No Configured Columns",
                help: "List how many here, and fill in the components in the Layout Creator",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "gutter",
                valueKey: "gutter",
                component: "number-input",
                label: "Gap between columns",
                defaultValue: 8,
                help: "Spacing (in pixels) between columns",
              },
            ],
          },
        ],
      },
    ],
  },
]
