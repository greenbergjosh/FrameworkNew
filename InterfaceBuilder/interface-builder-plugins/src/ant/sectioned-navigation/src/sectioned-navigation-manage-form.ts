import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const sectionedNavigationManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...sectionedNavigationManageFormDefinition, ...extend)
}

const sectionedNavigationManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "",
                hidden: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "title",
                valueKey: "title",
                label: "Title",
                component: "input",
                bindable: true,
              },
              {
                key: "sections",
                valueKey: "sections",
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
                label: "Sections",
                addItemLabel: "Add Section",
                emptyText: "No Configured Navigation Sections",
                help: "List the named sections here, and fill in the components in the Layout Creator",
              },
            ],
          },
        ],
      },
    ],
  },
]
