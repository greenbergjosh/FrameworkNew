import { baseManageForm } from "components/BaseInterfaceComponent/baseManageForm"
import { ComponentDefinition } from "../../../globalTypes"

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
                defaultValue: "Layout Creator",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "layout",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
