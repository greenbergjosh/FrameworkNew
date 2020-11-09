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
                key: "valueKey",
                defaultValue: "remote",
              },
              {
                key: "header",
                valueKey: "header",
                component: "input",
                label: "Header Text",
              },
              {
                key: "remoteId",
                valueKey: "remoteId",
                label: "Remote Component",
                component: "select",
                help: "Select which configuration item to repeat the layout from",
                dataHandlerType: "remote-config",
                remoteDataFilter: { "!!": { var: ["config.layout"] } },
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "indented",
                valueKey: "indented",
                label: "Indent?",
                component: "toggle",
                help: "Indent all components in the loaded layout",
                defaultValue: false,
              },
              {
                key: "collapsible",
                valueKey: "collapsible",
                label: "Collapsible?",
                component: "toggle",
                defaultValue: false,
              },
              {
                key: "startCollapsed",
                valueKey: "startCollapsed",
                label: "Start Collapsed?",
                component: "toggle",
                defaultValue: false,
              },
            ],
          },
        ],
      },
    ],
  },
]
