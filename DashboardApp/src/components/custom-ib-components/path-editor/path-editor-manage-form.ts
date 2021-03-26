import { baseManageForm, ComponentDefinition, supportedEditorTheme } from "@opg/interface-builder"

export const pathEditorManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...pathEditorManageFormDefinition, ...extend)
}

const pathEditorManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Path Editor",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "code",
                bindable: true,
              },
              {
                key: "defaultValue",
                valueKey: "defaultValue",
                component: "path-editor",
                defaultTheme: "vs-dark",
                label: "Default Value",
                bindable: true,
              },
            ],
          },
          {
            label: "Appearance",
            key: "appearance",
            components: [
              {
                key: "defaultTheme",
                valueKey: "defaultTheme",
                component: "select",
                defaultValue: "vs-dark",
                label: "Default Theme",
                help: "Select the highlighting theme to initially set for this code editor",
                dataHandlerType: "local",
                bindable: true,
                data: {
                  values: supportedEditorTheme,
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
