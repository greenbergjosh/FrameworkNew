import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

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
                component: "repeater",
                bindable: true,
                readonly: false,
                invisible: false,
                hidden: false,
                hasLastItemComponents: false,
                hasInitialRecord: false,
                emptyText: "No Tabs",
                addItemLabel: "Add Tab",
                label: "Repeater",
                hideLabel: true,
                components: [
                  {
                    key: "label",
                    valueKey: "label",
                    component: "input",
                    label: "Tab",
                    defaultValue: "Tab",
                    size: "small",
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
