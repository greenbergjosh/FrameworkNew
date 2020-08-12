import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const toggleManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...toggleManageFormDefinition, ...extend)
}

const toggleManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Toggle",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
              {
                key: "inverted",
                valueKey: "inverted",
                label: "Invert Value?",
                help: "For the case when toggled on should mean false and toggled off should mean true",
                component: "toggle",
                defaultValue: false,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "size",
                valueKey: "size",
                ordinal: 10,
                defaultValue: "default",
                label: "Size",
                component: "select",
                dataHandlerType: "local",
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
              },
            ],
          },
        ],
      },
    ],
  },
]
