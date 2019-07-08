import { baseManageForm } from "../base/base-component-form"
import { ComponentDefinition } from "../base/BaseInterfaceComponent"

export const formManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...formManageFormDefinition, ...extend)
}

const formManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Form",
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "orientation",
                valueKey: "orientation",
                label: "Orientation",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "vertical",
                data: {
                  values: [
                    {
                      label: "Vertical",
                      value: "vertical",
                    },
                    {
                      label: "Horizontal",
                      value: "horizontal",
                    },
                    {
                      label: "Inline",
                      value: "inline",
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
