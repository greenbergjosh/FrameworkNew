import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...wizardManageFormDefinition, ...extend)
}

const wizardManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Wizard",
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "",
                hidden: true,
              },
              {
                key: "disableStepNumbersChangingTabs",
                valueKey: "disableStepNumbersChangingTabs",
                component: "toggle",
                label: "Disable Step Numbers",
                help: "Prevent clicking on step numbers from changing the active tab.",
                defaultValue: true,
                bindable: true,
              },
              {
                key: "steps",
                valueKey: "steps",
                component: "list",
                bindable: true,
                components: [
                  {
                    component: "form",
                    label: "",
                    hideLabel: true,
                    components: [
                      {
                        key: "title",
                        valueKey: "title",
                        hideLabel: true,
                        component: "input",
                      },
                      {
                        key: "components",
                        valueKey: "components",
                        component: "list",
                        defaultValue: [],
                        hidden: true,
                      },
                    ],
                  },
                ],
                label: "Steps",
                addItemLabel: "Add Step",
                emptyText: "No Configured Steps",
                help: "List the named steps here, and fill in the components in the Layout Creator",
              },
            ],
          },
        ],
      },
    ],
  },
]
