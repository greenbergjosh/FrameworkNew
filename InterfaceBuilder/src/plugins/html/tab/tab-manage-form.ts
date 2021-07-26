import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const tabManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...tabManageFormDefinition, ...extend)
}

const tabManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Tab",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "tabKey",
                valueKey: "tabKey",
                component: "input",
                label: "Tab Key",
                help: "A unique id to identify this tab",
                bindable: true,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "title",
                valueKey: "title",
                component: "input",
                defaultValue: "Tab",
                label: "Title",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
