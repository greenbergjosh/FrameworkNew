import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
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
          {
            key: "appearance",
            components: [
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
                key: "bordered",
                valueKey: "bordered",
                label: "Bordered",
                component: "toggle",
                defaultValue: true,
                bindable: true,
              },
              {
                key: "showFieldList",
                valueKey: "showFieldList",
                label: "Field List",
                bindable: true,
                component: "toggle",
                defaultValue: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
