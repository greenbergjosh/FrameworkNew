import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { separator } from "./codec"

export const dataInputManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...csvInputManageFormDefinition, ...extend)
}

const csvInputManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                key: "maxLength",
                valueKey: "maxLength",
                ordinal: 10,
                component: "number-input",
                defaultValue: null,
                label: "Max length",
              },
              {
                key: "itemSeparator",
                valueKey: "itemSeparator",
                ordinal: 11,
                component: "select",
                label: "Item Separator",
                dataHandlerType: "local",
                defaultValue: "newLine",
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
