import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const remoteComponentManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...remoteComponentManageFormDefinition, ...extend)
}

const remoteComponentManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                hidden: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "remote",
                bindable: true,
              },
              {
                key: "header",
                valueKey: "header",
                component: "input",
                label: "Header Text",
                bindable: true,
              },
              {
                center: false,
                headerSize: "",
                textType: "warning",
                invisible: false,
                hidden: false,
                stringTemplate: "CAUTION: No Circular References!",
                description: "Do not include a config as a child of itself or your app will crash.",
                useTokens: false,
                showIcon: true,
                valueKey: "data",
                label: "Text",
                hideLabel: true,
                component: "text",
                marginTop: 20,
                marginBottom: 20,
                components: [],
                bindable: false,
              },
              {
                key: "remoteId",
                valueKey: "remoteId",
                label: "Remote Component",
                component: "select",
                help: "Select which configuration item to repeat the layout from",
                dataHandlerType: "remote-config",
                remoteDataFilter: { "!!": { var: ["config.layout"] } },
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "modeOverride",
                valueKey: "modeOverride",
                ordinal: 10,
                defaultValue: "display",
                label: "Mode",
                component: "select",
                dataHandlerType: "local",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Display",
                      value: "display",
                    },
                    {
                      label: "Edit",
                      value: "edit",
                    },
                    {
                      label: "Preview",
                      value: "preview",
                    },
                  ],
                },
              },
              {
                key: "indented",
                valueKey: "indented",
                label: "Indent?",
                component: "toggle",
                help: "Indent all components in the loaded layout",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "collapsible",
                valueKey: "collapsible",
                label: "Collapsible?",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "startCollapsed",
                valueKey: "startCollapsed",
                label: "Start Collapsed?",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
