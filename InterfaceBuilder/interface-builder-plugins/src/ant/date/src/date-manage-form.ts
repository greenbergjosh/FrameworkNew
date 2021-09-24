import { commonIncludeTimeForm } from "@opg/interface-builder-plugins/lib/ant/shared/common-include-time-form"
import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

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
