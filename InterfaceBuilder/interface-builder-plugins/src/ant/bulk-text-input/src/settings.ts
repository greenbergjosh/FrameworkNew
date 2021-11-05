import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"
import { separator } from "./codec"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
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
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
              },
              {
                key: "itemSeparator",
                valueKey: "itemSeparator",
                ordinal: 11,
                component: "select",
                label: "Item Separator",
                dataHandlerType: "local",
                defaultValue: separator.newline,
                bindable: true,
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
                label: "Autosize height",
                bindable: true,
              },
              {
                key: "newlinePlaceholder",
                valueKey: "newlinePlaceholder",
                ordinal: 11,
                component: "input",
                defaultValue: "Enter each item on a line by itself",
                label: "Placeholder",
                bindable: true,
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
                bindable: true,
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
                bindable: true,
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
                bindable: true,
                visibilityConditions: {
                  "===": [false, { var: "autosize" }],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
