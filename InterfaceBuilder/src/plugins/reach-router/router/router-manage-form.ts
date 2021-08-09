import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"
import { ComponentDefinition } from "../../../globalTypes"

export const routerManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...RouterManageFormDefinition, ...extend)
}

export const RouterManageFormDefinition: Partial<ComponentDefinition>[] = [
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
