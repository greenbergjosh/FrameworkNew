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
              },
              {
                key: "valueKey",
                defaultValue: "code",
              },
              {
                key: "defaultValue",
                valueKey: "defaultValue",
                component: "path-editor",
                defaultTheme: "vs-dark",
                label: "Default Value",
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
