import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const repeaterManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...repeaterManageFormDefinition, ...extend)
}

const repeaterManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Repeater",
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
              {
                key: "hasInitialRecord",
                valueKey: "hasInitialRecord",
                label: "Show Initial Form",
                help: "Show the form on start instead of the empty message.",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              {
                key: "hasLastItemComponents",
                valueKey: "hasLastItemComponents",
                label: "Last Item Template",
                help: "Provide a separate template for the last item in the collection.",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "readonly",
                valueKey: "readonly",
                label: "Read Only",
                component: "toggle",
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
