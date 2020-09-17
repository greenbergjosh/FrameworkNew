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
                component: "textarea",
                label: "Text",
                help: "Text can include simple jsonPath tokens as \"{$.propertyName}\" (model properties only)",
                defaultValue: "",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "textType",
                valueKey: "textType",
                label: "Type",
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
              {
                key: "headerSize",
                valueKey: "headerSize",
                label: "Heading Size",
                component: "select",
                defaultValue: "h2",
                dataHandlerType: "local",
                data: {
                  values: [
                    {
                      label: "H1",
                      value: "1",
                    },
                    {
                      label: "H2",
                      value: "2",
                    },
                    {
                      label: "H3",
                      value: "3",
                    },
                    {
                      label: "H4",
                      value: "4",
                    },
                  ],
                },
                visibilityConditions: {
                  "===": ["title", { var: "textType" }],
                },
              },
              {
                key: "center",
                valueKey: "center",
                label: "Center",
                component: "toggle",
                defaultValue: false,
              },
              {
                key: "marginTop",
                valueKey: "marginTop",
                label: "Top Margin",
                component: "number-input",
              },
              {
                key: "marginRight",
                valueKey: "marginRight",
                label: "Right Margin",
                component: "number-input",
              },
              {
                key: "marginBottom",
                valueKey: "marginBottom",
                label: "Bottom Margin",
                component: "number-input",
              },
              {
                key: "marginLeft",
                valueKey: "marginLeft",
                label: "Left Margin",
                component: "number-input",
              },
            ],
          },
        ],
      },
    ],
  },
]
