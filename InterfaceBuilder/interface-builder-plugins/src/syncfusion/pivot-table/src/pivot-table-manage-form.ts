import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const pivotTableManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...pivotTableManageFormDefinition, ...extend)
}

export const pivotTableManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Pivot Table Config",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "columns",
                bindable: true,
              },
              {
                key: "loadingKey",
                valueKey: "loadingKey",
                component: "input",
                defaultValue: "loading",
                label: "Loading Key",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "height",
                valueKey: "height",
                label: "Height",
                defaultValue: 350,
                help: "Height of the pivot table.",
                component: "number-input",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
