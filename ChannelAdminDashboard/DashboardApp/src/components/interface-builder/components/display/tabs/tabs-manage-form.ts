import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

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
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "tabNames",
                ordinal: 20,
                component: "list",
                itemsAs: {
                  component: "input",
                  label: "Tab {tabNames.index} name",
                  defaultValue: "Tab {tabNames.index}",
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
