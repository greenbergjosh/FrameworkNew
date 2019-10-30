import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const cardManageForm = (...extend: Partial<ComponentDefinition>[]) => {
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
                key: "title",
                valueKey: "title",
                component: "input",
                label: "Card Title",
                defaultValue: "Card Title",
              },
              {
                key: "extra",
                valueKey: "extra",
                component: "input",
                label: "Detail Text",
                defaultValue: "",
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
                defaultValue: true,
              },
              {
                key: "bordered",
                valueKey: "bordered",
                component: "toggle",
                label: "Show Border",
                defaultValue: false,
              },
              {
                key: "size",
                valueKey: "size",
                component: "select",
                label: "Card Size",
                defaultValue: "default",
                dataHandlerType: "local",
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
              },
            ]
          }
        ],
      },
    ],
  },
]
