import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import { baseSelectDataComponents } from "../../_shared/selectable/selectable-manage-form"

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

export const radioManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}