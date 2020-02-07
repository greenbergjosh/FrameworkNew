import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const dividerManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...dividerManageFormDefinition, ...extend)
}

const dividerManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "",
                hidden: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
                hidden: true,
              },
              {
                key: "valueKey",
                defaultValue: "",
                hidden: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "text",
                valueKey: "text",
                component: "input",
                defaultValue: "",
                label: "Label",
                help: "Text to appear on the divider itself",
              },
              {
                key: "textAlignment",
                valueKey: "textAlignment",
                component: "select",
                defaultValue: "center",
                label: "Text Alignment",
                help:
                  "Whether the text on the label should appear on the left, right, or center of the divider.",
                dataHandlerType: "local",
                data: {
                  values: [
                    {
                      label: "Left",
                      value: "left",
                    },
                    {
                      label: "Center",
                      value: "center",
                    },
                    {
                      label: "Right",
                      value: "right",
                    },
                  ],
                },
                visibilityConditions: {
                  "!!": { var: "text" },
                },
              },
              {
                key: "orientation",
                valueKey: "orientation",
                component: "select",
                defaultValue: "horizontal",
                label: "Orientation",
                help: "Whether the divider appears horizontally or vertically.",
                dataHandlerType: "local",
                data: {
                  values: [
                    {
                      label: "Horizontal",
                      value: "horizontal",
                    },
                    {
                      label: "Vertical",
                      value: "vertical",
                    },
                  ],
                },
              },
              {
                key: "dashed",
                valueKey: "dashed",
                component: "toggle",
                defaultValue: false,
                label: "Dashed",
                help: "Instead of a solid line, the divider can appear as a dashed line.",
              },
            ],
          },
        ],
      },
    ],
  },
]
