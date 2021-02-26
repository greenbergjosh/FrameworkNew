import { baseManageForm, ComponentDefinition, getIconSelectConfig } from "@opg/interface-builder"
import { remoteConfigSettings } from "./components/RemoteConfig/settings"
import { remoteQuerySettings } from "./components/RemoteQuery/settings"
import { remoteUrlSettings } from "./components/RemoteUrl/settings"

export const executeManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
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
                visibilityConditions: {
                  "===": [
                    "do-not-show",
                    {
                      var: ["queryType"],
                    },
                  ],
                },
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
                key: "outboundLoadingKey",
                valueKey: "outboundLoadingKey",
                label: "Loading Key",
                component: "input",
                defaultValue: "loading",
                help: "The key used to put loading state (true|false) into the model",
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
                label: "Execute Immediately?",
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
                dashed: false,
                orientation: "horizontal",
                textAlignment: "center",
                text: "",
                invisible: false,
                hidden: false,
                valueKey: "",
                label: "",
                hideLabel: false,
                component: "divider",
              },
              ...remoteQuerySettings,
              ...remoteConfigSettings,
              ...remoteUrlSettings,
              {
                key: "paramKVPMaps",
                valueKey: "paramKVPMaps.values",
                label: "Map Params",
                help: "For fields that need property name transformations applied, describe these here",
                component: "data-map",
                multiple: true,
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
