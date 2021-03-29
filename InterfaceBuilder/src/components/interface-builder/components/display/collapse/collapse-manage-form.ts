import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const collapseManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...collapseManageFormDefinition, ...extend)
}

const collapseManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Collapse",
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
                key: "accordion",
                valueKey: "accordion",
                label: "Accordion",
                help: "When accordion mode is active, only one section can be open at a time.",
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
              {
                key: "sections",
                valueKey: "sections",
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
                label: "Collapse Sections",
                addItemLabel: "Add Section",
                emptyText: "No Configured Collapse Sections",
                help: "List the named sections here, and fill in the components in the Layout Creator",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
