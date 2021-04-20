import { baseManageForm } from "components/BaseInterfaceComponent/baseManageForm"
import { ComponentDefinition } from "../../../globalTypes"

export const numberInputManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...numberInputManageFormDefinition, ...extend)
}

const numberInputManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Number",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
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
              },
            ],
          },
        ],
      },
    ],
  },
]
