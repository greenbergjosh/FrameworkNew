import { getIconSelectConfig } from "@opg/interface-builder-plugins/lib/ant/icon"
import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...buttonManageFormDefinition, ...extend)
}

export type shapeType = "circle" | "circle-outline" | "round" | undefined
export type sizeType = "small" | "large" | undefined
export type buttonDisplayType = "primary" | "ghost" | "dashed" | "danger" | "link" | undefined

const appearanceComponents = [
  {
    key: "displayType",
    valueKey: "displayType",
    component: "select",
    label: "Type",
    defaultValue: null,
    dataHandlerType: "local",
    ordinal: 11,
    bindable: true,
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
    bindable: true,
    data: {
      values: [
        {
          label: "Rectangle",
          value: null,
        },
        {
          label: "Rounded Rectangle",
          value: "round",
        },
        {
          label: "Circle",
          value: "circle",
        },
        {
          label: "Circle Outline",
          value: "circle-outline",
        },
      ],
    },
    visibilityConditions: {
      "!==": ["link", { var: ["displayType"] }],
    },
  },
  {
    ...getIconSelectConfig(["download", "cloud-download"]),
    ordinal: 13,
  },
  {
    key: "hideButtonLabel",
    valueKey: "hideButtonLabel",
    ordinal: 14,
    component: "toggle",
    defaultValue: false,
    label: "Hide Button Text",
    bindable: true,
    visibilityConditions: {
      and: [{ "!==": ["circle", { var: ["shape"] }] }, { "!==": ["circle-outline", { var: ["shape"] }] }],
    },
  },
  {
    key: "buttonLabel",
    valueKey: "buttonLabel",
    ordinal: 15,
    component: "input",
    defaultValue: "Button",
    label: "Button Text",
    bindable: true,
  },
  {
    key: "size",
    valueKey: "size",
    component: "select",
    label: "Size",
    defaultValue: null,
    dataHandlerType: "local",
    ordinal: 16,
    bindable: true,
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
    bindable: true,
    visibilityConditions: {
      and: [{ "!==": ["circle", { var: ["shape"] }] }, { "!==": ["circle-outline", { var: ["shape"] }] }],
    },
  },
  {
    key: "ghost",
    valueKey: "ghost",
    ordinal: 18,
    component: "toggle",
    defaultValue: false,
    label: "Contrast",
    help: "Increase contrast when placed over a dark background",
    bindable: true,
  },
]

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
                defaultValue: "Download File",
                bindable: true,
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "url",
                valueKey: "url",
                label: "URL",
                help: "",
                component: "input",
                defaultValue: "https://",
                bindable: true,
              },
              {
                key: "httpMethod",
                valueKey: "httpMethod",
                component: "select",
                label: "HTTP Method",
                defaultValue: "GET",
                dataHandlerType: "local",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "GET",
                      value: "GET",
                    },
                    {
                      label: "POST",
                      value: "POST",
                    },
                  ],
                },
              },
              {
                key: "useFilenameFromServer",
                valueKey: "useFilenameFromServer",
                component: "toggle",
                label: "Filename from server",
                defaultValue: true,
                bindable: true,
              },
              {
                key: "filename",
                valueKey: "filename",
                label: "Filename",
                help: "",
                component: "input",
                defaultValue: "",
                bindable: true,
                visibilityConditions: {
                  "===": [false, { var: ["useFilenameFromServer"] }],
                },
              },
              {
                key: "paramsValueKey",
                valueKey: "paramsValueKey",
                label: "Params Key (deprecated)",
                help: "Deprecated, please use Map Params instead",
                component: "input",
                defaultValue: "params",
                bindable: true,
                visibilityConditions: {
                  "===": ["POST", { var: ["httpMethod"] }],
                },
              },
              {
                key: "paramKVPMaps",
                valueKey: "paramKVPMaps.values",
                label: "Map Params",
                component: "data-map",
                multiple: true,
                bindable: true,
                keyComponent: {
                  label: "Param Field Name",
                  component: "input",
                  valueKey: "fieldName",
                },
                valueComponent: {
                  label: "Param Value Key",
                  component: "input",
                  valueKey: "valueKey",
                },
                visibilityConditions: {
                  "===": ["POST", { var: ["httpMethod"] }],
                },
              },
            ],
          },
          {
            key: "appearance",
            components: appearanceComponents,
          },
        ],
      },
    ],
  },
]
