import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { icons } from "../_shared/icon-select-form-config"

export const buttonManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...buttonManageFormDefinition, ...extend)
}

export type shapeType = "circle" | "circle-outline" | "round" | undefined
export type sizeType = "small" | "large" | undefined
export type buttonDisplayType = "primary" | "ghost" | "dashed" | "danger" | "link" | undefined

const buttonManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Button",
              },
              {
                key: "valueKey",
                hidden: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "displayType",
                valueKey: "displayType",
                component: "select",
                label: "Type",
                defaultValue: null,
                dataHandlerType: "local",
                ordinal: 11,
                data: {
                  values: [
                    {
                      label: "Default",
                      value: null,
                    },
                    {
                      label: "Primary",
                      value: "primary",
                    },
                    {
                      label: "Ghost",
                      value: "ghost",
                    },
                    {
                      label: "Dashed",
                      value: "dashed",
                    },
                    {
                      label: "Danger",
                      value: "danger",
                    },
                    {
                      label: "Link",
                      value: "link",
                    },
                  ],
                },
              },
              {
                key: "shape",
                valueKey: "shape",
                component: "select",
                label: "Shape",
                defaultValue: null,
                dataHandlerType: "local",
                ordinal: 12,
                data: {
                  values: [
                    {
                      label: "Rectangle (Default)",
                      value: null,
                    },
                    {
                      label: "Circle",
                      value: "circle",
                    },
                    {
                      label: "Circle Outline",
                      value: "circle-outline",
                    },
                    {
                      label: "Round",
                      value: "round",
                    },
                  ],
                },
                visibilityConditions: {
                  "!==": ["link", { var: ["displayType"] }],
                },
              },
              {
                ...icons,
                ordinal: 13,
              },
              {
                key: "hideButtonLabel",
                valueKey: "hideButtonLabel",
                ordinal: 14,
                component: "toggle",
                defaultValue: false,
                label: "Hide Button Label",
                visibilityConditions: {
                  "and": [
                    { "!==": ["circle", { var: ["shape"] }] },
                    { "!==": ["circle-outline", { var: ["shape"] }] },
                  ],
                },
              },
              {
                key: "buttonLabel",
                valueKey: "buttonLabel",
                ordinal: 15,
                component: "input",
                defaultValue: "Button",
                label: "Button Title",
              },
              {
                key: "size",
                valueKey: "size",
                component: "select",
                label: "Size",
                defaultValue: null,
                dataHandlerType: "local",
                ordinal: 16,
                data: {
                  values: [
                    {
                      label: "Small",
                      value: "small",
                    },
                    {
                      label: "Medium (Default)",
                      value: null,
                    },
                    {
                      label: "Large",
                      value: "large",
                    },
                  ],
                },
              },
              {
                key: "block",
                valueKey: "block",
                ordinal: 17,
                component: "toggle",
                defaultValue: false,
                label: "Full Width",
                visibilityConditions: {
                  "and": [
                    { "!==": ["circle", { var: ["shape"] }] },
                    { "!==": ["circle-outline", { var: ["shape"] }] },
                  ],
                },
              },
              {
                key: "ghost",
                valueKey: "ghost",
                ordinal: 18,
                component: "toggle",
                defaultValue: false,
                label: "Contrast",
                help: "Increase contrast when placed over a dark background"
              },
            ],
          },
        ],
      },
    ],
  },
]
