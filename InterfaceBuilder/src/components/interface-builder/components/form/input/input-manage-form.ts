import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const inputManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...inputManageFormDefinition, ...extend)
}

const inputManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Input Text",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
              {
                key: "maxLength",
                valueKey: "maxLength",
                ordinal: 10,
                component: "number-input",
                defaultValue: null,
                label: "Max length",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "placeholder",
                valueKey: "placeholder",
                component: "input",
                label: "Placeholder",
              },
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
