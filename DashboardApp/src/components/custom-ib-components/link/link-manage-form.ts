import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

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
                key: "useRouter",
                valueKey: "useRouter",
                label: "Use Router",
                help: "If the link is to a location within this application, turn this feature on for better performance",
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
              {
                key: "useUriTokens",
                valueKey: "useUriTokens",
                label: "Replace Link Tokens",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "uri",
                valueKey: "uri",
                component: "input",
                label: "Link",
                help: 'The link can include simple jsonPath tokens such as "?id={$.id}" (using model properties only)',
                defaultValue: "https://",
                bindable: true,
              },
              {
                key: "useLinkLabelKey",
                valueKey: "useLinkLabelKey",
                label: "Use Link Label Key",
                help: "Should this component get the label's value from data instead of a static value entered here?",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "linkLabel",
                valueKey: "linkLabel",
                component: "input",
                label: "Link Label",
                defaultValue: "",
                bindable: true,
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
                bindable: true,
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
                bindable: true,
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
