import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

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
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "components",
              },
              {
                key: "unwrapped",
                valueKey: "unwrapped",
                label: "Unwrapped?",
                help: "Normally, a list contains JSON objects, but unwrapping allows the list to contain scalar values",
                component: "toggle",
                defaultValue: false,
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
              },
              {
                key: "emptyText",
                valueKey: "emptyText",
                component: "input",
                defaultValue: "No Items",
                label: "Empty Text",
              },
            ],
          },
        ],
      },
    ],
  },
]
