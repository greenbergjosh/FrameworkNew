import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const tabsManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...tabsManageFormDefinition, ...extend)
}

const tabsManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Tabs",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "tabs",
                valueKey: "tabs",
                ordinal: 20,
                component: "list",
                bindable: true,
                components: [
                  {
                    key: "label",
                    valueKey: "label",
                    component: "input",
                    label: "Tab",
                    defaultValue: "Tab",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]
