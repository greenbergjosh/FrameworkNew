import { baseSelectDataComponents } from "../_shared/selectable/selectable-manage-form"
import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

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

export const tagsManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...selectManageFormDefinition, ...extend)
}
