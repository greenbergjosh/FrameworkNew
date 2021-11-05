import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...LinkManageFormDefinition, ...extend)
}

export const LinkManageFormDefinition: Partial<ComponentDefinition>[] = [
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
              },
              {
                key: "valueKey",
                defaultValue: "",
                bindable: true,
                label: "Bindable Data Key",
              },
              {
                center: false,
                headerSize: "4",
                textType: "info",
                invisible: false,
                hidden: false,
                stringTemplate:
                  'Provide a Value Key above when using tokens (e.g., "$.someVariable") in the URL or Link Label below. NOTE: Link Label will not be used if other components are nested in this link.',
                useTokens: false,
                valueKey: "data",
                label: "Text",
                hideLabel: true,
                component: "text",
                marginBottom: 20,
                components: [],
              },
              {
                key: "uri",
                valueKey: "uri",
                bindable: true,
                component: "input",
                defaultValue: "https://",
                help: 'URL may include jsonPath tokens (e.g., "?id={$.id}")',
                label: "URL",
              },
              {
                key: "linkLabel",
                valueKey: "linkLabel",
                component: "input",
                label: "Link Label",
                defaultValue: "",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "disabled",
                valueKey: "disabled",
                label: "Disabled",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
            ],
          },
          {
            key: "style",
            components: [],
          },
        ],
      },
    ],
  },
]
