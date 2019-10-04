import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { separator } from "./codec"

export const bulkTextInputManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...bulkTextInputManageFormDefinition, ...extend)
}

const bulkTextInputManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Text Area",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
              {
                key: "itemSeparator",
                valueKey: "itemSeparator",
                ordinal: 11,
                component: "select",
                label: "Item Separator",
                dataHandlerType: "local",
                defaultValue: separator.newline,
                data: {
                  values: [
                    {
                      label: "New Line (each item is on a line by itself)",
                      value: separator.newline,
                    },
                    {
                      label: 'Comma ("item1", "item2", etc)',
                      value: separator.comma,
                    },
                  ],
                },
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "autosize",
                valueKey: "autosize",
                ordinal: 11,
                component: "toggle",
                defaultValue: true,
                label: "Autosize height"
              },
              {
                key: "newlinePlaceholder",
                valueKey: "newlinePlaceholder",
                ordinal: 11,
                component: "input",
                defaultValue: "Enter each item on a line by itself",
                label: "Placeholder",
                visibilityConditions: {
                  "===": [separator.newline, { var: "itemSeparator" }],
                },
              },
              {
                key: "commaPlaceholder",
                valueKey: "commaPlaceholder",
                ordinal: 11,
                component: "input",
                defaultValue: "Enter items separated by commas",
                label: "Placeholder",
                visibilityConditions: {
                  "===": [separator.comma, { var: "itemSeparator" }],
                },
              },
              {
                key: "minRows",
                valueKey: "minRows",
                ordinal: 12,
                component: "number-input",
                defaultValue: null,
                label: "Min rows",
                visibilityConditions: {
                  "===": [false, { var: "autosize" }],
                },
              },
              {
                key: "maxRows",
                valueKey: "maxRows",
                ordinal: 13,
                component: "number-input",
                defaultValue: null,
                label: "Max rows",
                visibilityConditions: {
                  "===": [false, { var: "autosize" }],
                },
              },
            ]
          },
        ],
      },
    ],
  },
]
