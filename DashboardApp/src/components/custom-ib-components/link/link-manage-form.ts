import { baseManageForm, ComponentDefinition, Link } from "@opg/interface-builder"

export const linkManageForm = (...extend: Partial<ComponentDefinition>[]) => {
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
                key: "label",
                defaultValue: "Link",
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
                key: "useRouter",
                valueKey: "useRouter",
                label: "Use Router",
                help:
                  "If the link is to a location within this application, turn this feature on for better performance",
                component: "toggle",
                defaultValue: true,
              },
              {
                key: "useUriTokens",
                valueKey: "useUriTokens",
                label: "Replace Link Tokens",
                component: "toggle",
                defaultValue: false,
              },
              {
                key: "uri",
                valueKey: "uri",
                component: "input",
                label: "Link",
                help: 'The link can include simple jsonPath tokens such as "?id={$.id}" (using model properties only)',
                defaultValue: "https://",
              },
              {
                key: "useLinkLabelKey",
                valueKey: "useLinkLabelKey",
                label: "Use Link Label Key",
                help: "Should this component get the label's value from data instead of a static value entered here?",
                component: "toggle",
                defaultValue: false,
              },
              {
                key: "linkLabel",
                valueKey: "linkLabel",
                component: "input",
                label: "Link Label",
                defaultValue: "",
                visibilityConditions: {
                  and: [
                    {
                      "===": [false, { var: "useLinkLabelKey" }],
                    },
                  ],
                },
              },
              {
                key: "linkLabelKey",
                valueKey: "linkLabelKey",
                component: "input",
                label: "Link Label Key",
                defaultValue: "",
                visibilityConditions: {
                  and: [
                    {
                      "===": [true, { var: "useLinkLabelKey" }],
                    },
                  ],
                },
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "linkType",
                valueKey: "linkType",
                label: "Link Type",
                component: "select",
                defaultValue: "link",
                dataHandlerType: "local",
                data: {
                  values: [
                    {
                      label: "Link",
                      value: "link",
                    },
                    {
                      label: "Default",
                      value: "default",
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
                      label: "Danger",
                      value: "danger",
                    },
                    {
                      label: "Dashed",
                      value: "dashed",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
