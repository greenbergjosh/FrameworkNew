import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const relationshipsManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...relationshipsManageFormDefinition, ...extend)
}

export const relationshipsManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Relationships",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "id",
                bindable: true,
              },
              {
                key: "linkPath",
                valueKey: "linkPath",
                label: "Path",
                component: "input",
                help: "Path to this resource.",
                defaultValue: "/global-config/",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [],
          },
        ],
      },
    ],
  },
]
