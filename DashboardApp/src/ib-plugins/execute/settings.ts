import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"
import { remoteConfigSettings } from "./components/RemoteConfig/settings"
import { remoteQuerySettings } from "./components/RemoteQuery/settings"
import { remoteUrlSettings } from "./components/RemoteUrl/settings"

export const settings = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
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
                key: "valueKey",
                defaultValue: "data",
                help: "The key used to get data from the model",
                bindable: true,
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
                bindable: true,
              },
              {
                key: "outboundLoadingKey",
                valueKey: "outboundLoadingKey",
                label: "Loading Key",
                component: "input",
                defaultValue: "loading",
                help: "The key used to put loading state (true|false) into the model",
                bindable: true,
              },
              {
                key: "header",
                valueKey: "header",
                component: "input",
                label: "Header",
                bindable: true,
              },
              {
                key: "executeImmediately",
                valueKey: "executeImmediately",
                component: "toggle",
                defaultValue: false,
                label: "Execute Immediately?",
                help: "Should this action be executed when the page loads?",
                bindable: true,
              },
              {
                key: "autoExecuteIntervalSeconds",
                valueKey: "autoExecuteIntervalSeconds",
                component: "number-input",
                defaultValue: null,
                label: "Auto Execute Interval Seconds",
                help: "The number of seconds between auto-execution. (0 or blank to disable)",
                bindable: true,
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
                bindable: true,
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
              },
            ],
          },
          {
            key: "appearance",
            components: [],
          },
        ],
      },
    ],
  },
]
