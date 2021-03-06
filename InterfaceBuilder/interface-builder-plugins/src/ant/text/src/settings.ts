import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
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
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
                bindable: true,
              },
              {
                key: "stringTemplate",
                valueKey: "stringTemplate",
                component: "textarea",
                label: "Text",
                help: 'Text can include simple jsonPath tokens as "{$.propertyName}" (using model properties only)',
                defaultValue: "",
                bindable: true,
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
                bindable: true,
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
                    {
                      label: "Success",
                      value: "success",
                    },
                    {
                      label: "Info",
                      value: "info",
                    },
                    {
                      label: "Warning",
                      value: "warning",
                    },
                    {
                      label: "Error",
                      value: "error",
                    },
                  ],
                },
              },
              {
                key: "showIcon",
                valueKey: "showIcon",
                label: "Show Icon",
                component: "toggle",
                defaultValue: false,
                bindable: true,
                visibilityConditions: {
                  or: [
                    {
                      "===": ["success", { var: "textType" }],
                    },
                    {
                      "===": ["info", { var: "textType" }],
                    },
                    {
                      "===": ["warning", { var: "textType" }],
                    },
                    {
                      "===": ["error", { var: "textType" }],
                    },
                  ],
                },
              },
              {
                key: "description",
                valueKey: "description",
                component: "input",
                label: "Description",
                defaultValue: "",
                bindable: true,
                visibilityConditions: {
                  or: [
                    {
                      "===": ["success", { var: "textType" }],
                    },
                    {
                      "===": ["info", { var: "textType" }],
                    },
                    {
                      "===": ["warning", { var: "textType" }],
                    },
                    {
                      "===": ["error", { var: "textType" }],
                    },
                  ],
                },
              },
              {
                key: "banner",
                valueKey: "banner",
                label: "Banner",
                component: "toggle",
                defaultValue: false,
                bindable: true,
                visibilityConditions: {
                  or: [
                    {
                      "===": ["success", { var: "textType" }],
                    },
                    {
                      "===": ["info", { var: "textType" }],
                    },
                    {
                      "===": ["warning", { var: "textType" }],
                    },
                    {
                      "===": ["error", { var: "textType" }],
                    },
                  ],
                },
              },
              {
                key: "closable",
                valueKey: "closable",
                label: "Closeable",
                component: "toggle",
                defaultValue: false,
                bindable: true,
                visibilityConditions: {
                  or: [
                    {
                      "===": ["success", { var: "textType" }],
                    },
                    {
                      "===": ["info", { var: "textType" }],
                    },
                    {
                      "===": ["warning", { var: "textType" }],
                    },
                    {
                      "===": ["error", { var: "textType" }],
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
                bindable: true,
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
                bindable: true,
              },
              {
                key: "marginTop",
                valueKey: "marginTop",
                label: "Top Margin",
                component: "number-input",
                bindable: true,
              },
              {
                key: "marginRight",
                valueKey: "marginRight",
                label: "Right Margin",
                component: "number-input",
                bindable: true,
              },
              {
                key: "marginBottom",
                valueKey: "marginBottom",
                label: "Bottom Margin",
                component: "number-input",
                bindable: true,
              },
              {
                key: "marginLeft",
                valueKey: "marginLeft",
                label: "Left Margin",
                component: "number-input",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
