import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const devToolsManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...devToolsManageFormDefinition, ...extend)
}

export const devToolsManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Dev Tools",
                hidden: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
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
                component: "number-input",
                label: "Height",
                defaultValue: 150,
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
