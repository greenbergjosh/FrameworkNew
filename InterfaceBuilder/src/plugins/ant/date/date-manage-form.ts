import { commonIncludeTimeForm } from "../_shared/common-include-time-form"
import { baseManageForm } from "components/BaseInterfaceComponent/baseManageForm"
import { ComponentDefinition } from "../../../globalTypes"

export const dateManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...dateManageFormDefinition, ...extend)
}

const dateManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Date",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "date",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [...commonIncludeTimeForm],
          },
        ],
      },
    ],
  },
]
