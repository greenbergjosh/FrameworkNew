import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const userInterfaceManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...userInterfaceManageFormDefinition, ...extend)
}

const userInterfaceManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "User Interface",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "layout",
                bindable: true,
              },
              {
                key: "hideMenu",
                valueKey: "hideMenu",
                label: "Hide Menu",
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
