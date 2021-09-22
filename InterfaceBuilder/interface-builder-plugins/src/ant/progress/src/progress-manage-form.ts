import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const progressManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...progressManageFormDefinition, ...extend)
}

const progressManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Progress",
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
                key: "calculatePercent",
                valueKey: "calculatePercent",
                component: "toggle",
                defaultValue: false,
                label: "Calculate Percent",
                help:
                  "Calculate the percent from the current count and a maximum value. When not selected, the data is assumed to be a percentage.",
                bindable: true,
              },
              {
                key: "maxValueKey",
                valueKey: "maxValueKey",
                component: "input",
                defaultValue: "maxValue",
                label: "Max Value API Key",
                help: "The API property name to use for the Progress component's maximum value.",
                bindable: true,
                visibilityConditions: {
                  "===": [true, { var: "calculatePercent" }],
                },
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "forceStatus",
                valueKey: "forceStatus",
                component: "select",
                defaultValue: "normal",
                label: "Status",
                dataHandlerType: "local",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Normal",
                      value: "normal",
                    },
                    {
                      label: "Active",
                      value: "active",
                    },
                    {
                      label: "Success",
                      value: "success",
                    },
                    {
                      label: "Exception",
                      value: "exception",
                    },
                    {
                      label: "Read from API",
                      value: "useAPI",
                    },
                  ],
                },
              },
              {
                key: "statusGroup",
                valueKey: "statusGroup",
                label: "Status Options",
                component: "card",
                bindable: true,
                components: [
                  {
                    key: "statusKey",
                    valueKey: "statusKey",
                    component: "input",
                    defaultValue: "status",
                    label: "API Key for Status",
                    help: "The API property name to use for the Progress component status.",
                  },
                  {
                    key: "statuses.normal",
                    valueKey: "statuses.normal",
                    component: "input",
                    defaultValue: "normal",
                    label: "Normal Value",
                  },
                  {
                    key: "statuses.active",
                    valueKey: "statuses.active",
                    component: "input",
                    defaultValue: "active",
                    label: "Active Value",
                  },
                  {
                    key: "statuses.success",
                    valueKey: "statuses.success",
                    component: "input",
                    defaultValue: "success",
                    label: "Success Value",
                  },
                  {
                    key: "statuses.exception",
                    valueKey: "statuses.exception",
                    component: "input",
                    defaultValue: "exception",
                    label: "Exception Value",
                  },
                ],
                visibilityConditions: {
                  "===": ["useAPI", { var: "forceStatus" }],
                },
              },
              {
                key: "type",
                valueKey: "type",
                component: "select",
                label: "Progress Type",
                defaultValue: "line",
                dataHandlerType: "local",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Line",
                      value: "line",
                    },
                    {
                      label: "Circle",
                      value: "circle",
                    },
                    {
                      label: "Gauge",
                      value: "dashboard",
                    },
                  ],
                },
              },
              {
                key: "smallLine",
                valueKey: "smallLine",
                component: "toggle",
                label: "Small Line",
                defaultValue: false,
                dataHandlerType: "local",
                bindable: true,
                visibilityConditions: {
                  "===": ["line", { var: "type" }],
                },
              },
              {
                key: "width",
                valueKey: "width",
                component: "number-input",
                label: "Width",
                dataHandlerType: "local",
                bindable: true,
                visibilityConditions: {
                  "!==": ["line", { var: "type" }],
                },
              },
              {
                key: "hideInfo",
                valueKey: "hideInfo",
                component: "toggle",
                label: "Hide Info",
                defaultValue: false,
                help: "Hide progress summary information",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
