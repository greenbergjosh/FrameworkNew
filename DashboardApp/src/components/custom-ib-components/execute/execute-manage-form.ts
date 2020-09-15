import { baseManageForm, ComponentDefinition, getIconSelectConfig } from "@opg/interface-builder"

export const executeManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...executeManageFormDefinition, ...extend)
}

const executeManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                key: "hideLabel",
                defaultValue: true,
                hidden: true,
              },
              {
                key: "label",
                defaultValue: null,
                hidden: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
                help: "The key used to get data from the model",
              },
              {
                key: "outboundValueKey",
                valueKey: "outboundValueKey",
                label: "Outbound Value Key",
                component: "input",
                defaultValue: "data",
                help: "The key used to put data into the model",
              },
              {
                key: "header",
                valueKey: "header",
                component: "input",
                label: "Header",
              },
              {
                key: "executeImmediately",
                valueKey: "executeImmediately",
                component: "toggle",
                defaultValue: false,
                label: "Execute immediately?",
                help: "Should this action be executed when the page loads?",
              },
              {
                key: "autoExecuteIntervalSeconds",
                valueKey: "autoExecuteIntervalSeconds",
                component: "number-input",
                defaultValue: null,
                label: "Auto Execute Interval Seconds",
                help: "The number of seconds between auto-execution. (0 or blank to disable)",
                visibilityConditions: {
                  "===": [
                    true,
                    {
                      var: ["executeImmediately"],
                    },
                  ],
                },
              },
              {
                key: "queryType",
                valueKey: "queryType",
                label: "Data Source",
                component: "select",
                help: "How to fetch the data for this query",
                dataHandlerType: "local",
                data: {
                  values: [
                    {
                      label: "Remote Query",
                      value: "remote-query",
                    },
                    {
                      label: "Remote Config",
                      value: "remote-config",
                    },
                    {
                      label: "Remote URL",
                      value: "remote-url",
                    },
                  ],
                },
                defaultValue: "remote-query",
              },
              {
                key: "remoteQuery",
                valueKey: "remoteQuery",
                label: "Remote Query",
                component: "select",
                dataHandlerType: "remote-config",
                // remoteDataFilter: {
                //   // Set of both
                //   or: [
                //     // Queries with no parameter options
                //     { "!": { var: "config.parameters" } },
                //     // and Queries with all parameter options filled in
                //     { all: [{ var: "config.parameters" }, { "!!": { var: "defaultValue" } }] },
                //   ],
                // },
                remoteConfigType: "Report.Query",
                visibilityConditions: {
                  and: [
                    {
                      "===": [
                        "remote-query",
                        {
                          var: ["queryType"],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                key: "remoteQueryMapping",
                valueKey: "remoteQueryMapping",
                label: "Query Mapping",
                help: "Forfields that need property name transformations applied, describe these here",
                component: "data-map",
                count: 2,
                defaultValue: [
                  { label: "label", value: "" },
                  { label: "value", value: "" },
                ],
                keyComponent: {
                  label: "Property",
                  component: "input",
                  valueKey: "value",
                },
                valueComponent: {
                  label: "Mapping",
                  component: "input",
                  valueKey: "value",
                },
                visibilityConditions: {
                  "===": [
                    "remote-query",
                    {
                      var: ["queryType"],
                    },
                  ],
                },
              },
              {
                key: "remoteConfigType",
                valueKey: "remoteConfigType",
                label: "Remote Config Type",
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: "EntityType",
                visibilityConditions: {
                  "===": [
                    "remote-config",
                    {
                      var: ["queryType"],
                    },
                  ],
                },
              },
              {
                key: "remoteUrl",
                valueKey: "remoteUrl",
                label: "Remote Url",
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: "Report.Query",
                visibilityConditions: {
                  "===": [
                    "remote-url",
                    {
                      var: ["queryType"],
                    },
                  ],
                },
              },
              {
                key: "isCRUD",
                valueKey: "isCRUD",
                component: "toggle",
                defaultValue: false,
                label: "CRUD Operation",
                help: "Does this query CReate Update or Delete data?",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "displayType",
                valueKey: "buttonProps.displayType",
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
                valueKey: "buttonProps.shape",
                component: "select",
                label: "Shape",
                defaultValue: null,
                dataHandlerType: "local",
                ordinal: 12,
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
                valueKey: "buttonProps.icon",
                ordinal: 13,
              },
              {
                key: "hideButtonLabel",
                valueKey: "buttonProps.hideButtonLabel",
                ordinal: 14,
                component: "toggle",
                defaultValue: false,
                label: "Hide Button Text",
                visibilityConditions: {
                  and: [{ "!==": ["circle", { var: ["shape"] }] }, { "!==": ["circle-outline", { var: ["shape"] }] }],
                },
              },
              {
                key: "buttonLabel",
                valueKey: "buttonProps.buttonLabel",
                ordinal: 15,
                component: "input",
                defaultValue: "Button",
                label: "Button Text",
              },
              {
                key: "size",
                valueKey: "buttonProps.size",
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
                valueKey: "buttonProps.block",
                ordinal: 17,
                component: "toggle",
                defaultValue: false,
                label: "Full Width",
                visibilityConditions: {
                  and: [{ "!==": ["circle", { var: ["shape"] }] }, { "!==": ["circle-outline", { var: ["shape"] }] }],
                },
              },
              {
                key: "ghost",
                valueKey: "buttonProps.ghost",
                ordinal: 18,
                component: "toggle",
                defaultValue: false,
                label: "Contrast",
                help: "Increase contrast when placed over a dark background",
              },
              {
                key: "requireConfirmation",
                valueKey: "buttonProps.requireConfirmation",
                ordinal: 5,
                component: "toggle",
                defaultValue: false,
                label: "Require Confirmation",
                help: "Requires the user to confirm this action before it will be executed.",
              },
              {
                key: "confirmation.title",
                valueKey: "buttonProps.confirmation.title",
                ordinal: 10,
                component: "input",
                defaultValue: "Are you sure?",
                label: "Confirmation Title",
                visibilityConditions: {
                  "===": [true, { var: "requireConfirmation" }],
                },
              },
              {
                key: "confirmation.message",
                valueKey: "buttonProps.confirmation.message",
                ordinal: 12,
                component: "input",
                defaultValue: "This action cannot be undone and may take a while. Are you sure?",
                label: "Confirmation Message",
                visibilityConditions: {
                  "===": [true, { var: "requireConfirmation" }],
                },
              },
              {
                key: "confirmation.okText",
                valueKey: "buttonProps.confirmation.okText",
                ordinal: 14,
                component: "input",
                defaultValue: "Continue",
                label: "OK Option Text",
                visibilityConditions: {
                  "===": [true, { var: "requireConfirmation" }],
                },
              },
              {
                key: "confirmation.cancelText",
                valueKey: "buttonProps.confirmation.cancelText",
                ordinal: 16,
                component: "input",
                defaultValue: "Cancel",
                label: "Cancel Option Text",
                visibilityConditions: {
                  "===": [true, { var: "requireConfirmation" }],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
