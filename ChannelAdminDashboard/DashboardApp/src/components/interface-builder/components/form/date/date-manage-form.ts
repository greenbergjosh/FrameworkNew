import { commonIncludeTimeForm } from "../_shared/common-include-time-form"
import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

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
              },
              {
                key: "valueKey",
                defaultValue: "date",
              },
            ],
          },
          {
            key: "appearance",
            components: [
              ...commonIncludeTimeForm,
            ]
          }
        ],
      },
    ],
  },
]