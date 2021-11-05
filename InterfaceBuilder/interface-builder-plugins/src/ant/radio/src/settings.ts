import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"
import { baseSelectDataComponents } from "@opg/interface-builder-plugins/lib/ant/shared"

export const selectManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "base",
    components: [
      {
        key: "tabs",
        tabs: [
          {
            key: "data",
            components: [...baseSelectDataComponents],
          },
          {
            key: "appearance",
            components: [
              {
                component: "radio",
                dataHandlerType: "local",
                defaultValue: "radio",
                hidden: false,
                hideLabel: false,
                invisible: false,
                key: "buttonType",
                label: "Button Type",
                size: "default",
                valueKey: "buttonType",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Radio",
                      value: "radio",
                    },
                    {
                      label: "Button",
                      value: "button",
                    },
                  ],
                },
              },
              {
                component: "radio",
                dataHandlerType: "local",
                hidden: false,
                hideLabel: false,
                invisible: false,
                key: "size",
                label: "Size",
                size: "default",
                valueKey: "size",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Small",
                      value: "small",
                    },
                    {
                      label: "Default",
                      value: "default",
                    },
                    {
                      label: "Large",
                      value: "large",
                    },
                  ],
                },
                visibilityConditions: {
                  "===": ["button", { var: ["buttonType"] }],
                },
              },
              {
                component: "radio",
                dataHandlerType: "local",
                defaultValue: "solid",
                hidden: false,
                hideLabel: false,
                invisible: false,
                key: "buttonStyle",
                label: "Style",
                size: "default",
                valueKey: "buttonStyle",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Solid",
                      value: "solid",
                    },
                    {
                      label: "Outline",
                      value: "outline",
                    },
                  ],
                },
                visibilityConditions: {
                  "===": ["button", { var: ["buttonType"] }],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}
