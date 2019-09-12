import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

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
                key: "calculatePercent",
                valueKey: "calculatePercent",
                component: "toggle",
                defaultValue: false,
                label: "Calculate Percent",
                help: "Calculate the percent from the current count and maximum value.",
              },
              {
                key: "maxValueKey",
                valueKey: "maxValueKey",
                component: "input",
                defaultValue: "maxValue",
                label: "Max Value API Key",
                help: "The API property name to use for the Progress component's maximum value.",
                visibilityConditions: {
                  "===": [true, { var: "calculatePercent" }],
                },
              },
              {
                key: "appearanceGroup",
                valueKey: "appearanceGroup",
                label: "Appearance Options",
                component: "card",
                components: [
                  {
                    key: "indicateStatus",
                    valueKey: "indicateStatus",
                    component: "toggle",
                    defaultValue: false,
                    label: "Indicate Status",
                  },
                  {
                    key: "statusGroup",
                    valueKey: "statusGroup",
                    label: "Status Options",
                    component: "card",
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
                        key: "statusActive",
                        valueKey: "statusActive",
                        component: "input",
                        defaultValue: "active",
                        label: "Active Value",
                      },
                      {
                        key: "statusSuccess",
                        valueKey: "statusSuccess",
                        component: "input",
                        defaultValue: "success",
                        label: "Success Value",
                      },
                      {
                        key: "statusException",
                        valueKey: "statusException",
                        component: "input",
                        defaultValue: "exception",
                        label: "Exception Value",
                        visibilityConditions: {
                          "===": [true, { var: "indicateStatus" }],
                        },
                      },
                    ],
                    visibilityConditions: {
                      "===": [true, { var: "indicateStatus" }],
                    },
                  },
                  {
                    key: "type",
                    valueKey: "type",
                    component: "select",
                    label: "Progress Type",
                    defaultValue: "line",
                    dataHandlerType: "local",
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
                          label: "Dashboard",
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
                    help: "Hide progress summary information"
                  },
                ]
              },
            ],
          },
        ],
      },
    ],
  },
]
