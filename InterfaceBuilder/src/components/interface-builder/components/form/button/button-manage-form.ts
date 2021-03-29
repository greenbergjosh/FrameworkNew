import { getIconSelectConfig } from "../_shared/icon-select-form-config"
import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const buttonManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...buttonManageFormDefinition, ...extend)
}

export type shapeType = "circle" | "circle-outline" | "round" | undefined
export type sizeType = "small" | "large" | undefined
export type buttonDisplayType = "primary" | "ghost" | "dashed" | "danger" | "link" | undefined

const dataTab = {
  key: "data",
  components: [
    {
      key: "label",
      hidden: true,
      bindable: true,
    },
    {
      key: "valueKey",
      hidden: true,
      bindable: true,
    },
    {
      key: "paramKVPMaps",
      valueKey: "paramKVPMaps.values",
      label: "Map Params",
      component: "data-map",
      multiple: true,
      bindable: true,
      keyComponent: {
        label: "Param Source Key",
        help: "Where to get the data",
        component: "input",
        valueKey: "sourceKey",
      },
      valueComponent: {
        label: "Param Target Key",
        help: "Where to put the data for other components to use",
        component: "input",
        valueKey: "targetKey",
      },
    },
  ],
}

const confirmationSettings = [
  {
    hidden: false,
    dashed: false,
    orientation: "horizontal",
    textAlignment: "center",
    text: "",
    valueKey: "",
    label: "",
    hideLabel: false,
    component: "divider",
  },
  {
    center: false,
    headerSize: "4",
    textType: "title",
    invisible: false,
    hidden: false,
    stringTemplate: "Confirmation Dialog",
    useTokens: false,
    valueKey: "data",
    label: "Text",
    hideLabel: true,
    component: "text",
    marginBottom: 20,
    components: [],
  },
  {
    key: "requireConfirmation",
    valueKey: "requireConfirmation",
    ordinal: 5,
    component: "toggle",
    defaultValue: false,
    label: "Require Confirm",
    help: "Requires the user to confirm this action before it will be executed.",
    bindable: true,
  },
  {
    key: "confirmation.title",
    valueKey: "confirmation.title",
    ordinal: 10,
    component: "input",
    defaultValue: "Are you sure?",
    label: "Title",
    bindable: true,
    visibilityConditions: {
      "===": [true, { var: "requireConfirmation" }],
    },
  },
  {
    key: "confirmation.message",
    valueKey: "confirmation.message",
    ordinal: 12,
    component: "input",
    defaultValue: "This action cannot be undone and may take a while. Are you sure?",
    label: "Message",
    bindable: true,
    visibilityConditions: {
      "===": [true, { var: "requireConfirmation" }],
    },
  },
  {
    key: "confirmation.okText",
    valueKey: "confirmation.okText",
    ordinal: 14,
    component: "input",
    defaultValue: "Continue",
    label: "OK Button Label",
    bindable: true,
    visibilityConditions: {
      "===": [true, { var: "requireConfirmation" }],
    },
  },
  {
    key: "confirmation.cancelText",
    valueKey: "confirmation.cancelText",
    ordinal: 16,
    component: "input",
    defaultValue: "Cancel",
    label: "Cancel Button Label",
    bindable: true,
    visibilityConditions: {
      "===": [true, { var: "requireConfirmation" }],
    },
  },
]

const appearanceTab = {
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
      ...getIconSelectConfig(),
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
    ...confirmationSettings,
  ],
}

const buttonManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "base",
    components: [
      {
        key: "tabs",
        tabs: [dataTab, appearanceTab],
      },
    ],
  },
]
