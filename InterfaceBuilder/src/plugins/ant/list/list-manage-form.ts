import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const listManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...listManageFormDefinition, ...extend)
}

const listManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Components",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "components",
                bindable: true,
              },
              {
                key: "unwrapped",
                valueKey: "unwrapped",
                label: "Unwrapped?",
                help: "Normally, a list contains JSON objects, but unwrapping allows the list to contain scalar values",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "interleave",
                valueKey: "interleave",
                label: "Interleave",
                help:
                  "None - Single component repeated; Round Robin - Each component used in turn; Whole Set - Each component used every time.",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "none",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "None",
                      value: "none",
                    },
                    {
                      label: "Round Robin",
                      value: "round-robin",
                    },
                    {
                      label: "Whole Set",
                      value: "set",
                    },
                  ],
                },
              },
              {
                key: "addItemLabel",
                valueKey: "addItemLabel",
                component: "input",
                defaultValue: "Add Item",
                label: "'Add' Button Text",
                bindable: true,
              },
              {
                key: "emptyText",
                valueKey: "emptyText",
                component: "input",
                defaultValue: "No Items",
                label: "Empty Text",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
