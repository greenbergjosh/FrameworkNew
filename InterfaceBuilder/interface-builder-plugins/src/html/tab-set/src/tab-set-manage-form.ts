import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const tabSetManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...tabSetManageFormDefinition, ...extend)
}

const tabSetManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Tab Set",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "defaultActiveTabKey",
                valueKey: "defaultActiveTabKey",
                component: "input",
                label: "Default Selected Tab Key",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
