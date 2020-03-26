import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const wizardManageForm = (...extend: Partial<ComponentDefinition>[]) => {
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
                key: "steps",
                valueKey: "steps",
                component: "list",
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