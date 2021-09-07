import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const containerManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...ContainerManageFormDefinition, ...extend)
}

const ContainerManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "",
                bindable: true,
                hidden: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [],
          },
          {
            key: "style",
            components: [],
          },
        ],
      },
    ],
  },
]
