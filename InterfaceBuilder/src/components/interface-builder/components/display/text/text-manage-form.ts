import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const textManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...textManageFormDefinition, ...extend)
}

export const textManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Text",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
              },
              {
                key: "useTokens",
                valueKey: "useTokens",
                label: "Replace Tokens",
                component: "toggle",
                defaultValue: false,
              },
              {
                key: "stringTemplate",
                valueKey: "stringTemplate",
                component: "input",
                label: "Text",
                help: "Text can include simple jsonPath tokens (model properties only)",
                defaultValue: "",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "textStyle",
                valueKey: "textStyle",
                label: "Style",
                component: "select",
                defaultValue: "text",
                dataHandlerType: "local",
                data: {
                  values: [
                    {
                      label: "Text",
                      value: "text",
                    },
                    {
                      label: "Code",
                      value: "code",
                    },
                    {
                      label: "Paragraph",
                      value: "paragraph",
                    },
                    {
                      label: "Title",
                      value: "title",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
