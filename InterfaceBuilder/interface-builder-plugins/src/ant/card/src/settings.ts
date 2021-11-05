import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...cardManageFormDefinition, ...extend)
}

const cardManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Card",
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
                key: "title",
                valueKey: "title",
                component: "input",
                label: "Card Title",
                defaultValue: "Card Title",
                bindable: true,
              },
              {
                key: "extra",
                valueKey: "extra",
                component: "input",
                label: "Detail Text",
                defaultValue: "",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "hoverable",
                valueKey: "hoverable",
                component: "toggle",
                label: "Hover Effect",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "bordered",
                valueKey: "bordered",
                component: "toggle",
                label: "Show Border",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "size",
                valueKey: "size",
                component: "select",
                label: "Card Size",
                defaultValue: "default",
                dataHandlerType: "local",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Standard",
                      value: "default",
                    },
                    {
                      label: "Small",
                      value: "small",
                    },
                  ],
                },
              },
              {
                key: "inset",
                valueKey: "inset",
                component: "toggle",
                label: "Show Inset",
                defaultValue: false,
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
