import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

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
                key: "hideLabel",
                defaultValue: true,
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
                bindable: true,
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
