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
            components: [
              {
                key: "multiple",
                valueKey: "multiple",
                label: "Allow Multiple",
                help: "Allow the user to select multiple items.",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              ...baseSelectDataComponents,
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "placeholder",
                valueKey: "placeholder",
                label: "Placeholder",
                help: "The greyed out text to appear in the box when no item is selected",
                component: "input",
                defaultValue: null,
                bindable: true,
              },
              {
                key: "allowClear",
                valueKey: "allowClear",
                label: "Allow Clear",
                help: "Allow the user to clear the selection.",
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
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

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}
