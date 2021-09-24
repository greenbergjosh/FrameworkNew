import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const supportedEditorLang = [
  { label: "C#", value: "csharp" },
  { label: "CSS", value: "css" },
  { label: "Sass", value: "scss" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "TypeScript", value: "typescript" },
  { label: "SQL", value: "sql" },
]

export const supportedEditorTheme = [
  { label: "VS", value: "vs" },
  { label: "VS Dark", value: "vs-dark" },
  { label: "High Contrast Dark", value: "hc-black" },
]

export const codeEditorManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...codeEditorFormDefinition, ...extend)
}

const codeEditorFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Code Editor",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "code",
                bindable: true,
              },
              {
                key: "defaultLanguage",
                valueKey: "defaultLanguage",
                component: "select",
                defaultValue: "json",
                label: "Default Language",
                help: "Select the code language to initially set for this code editor",
                dataHandlerType: "local",
                bindable: true,
                data: {
                  values: supportedEditorLang,
                },
              },
              {
                key: "defaultValue",
                valueKey: "defaultValue",
                component: "code-editor",
                defaultTheme: "vs-dark",
                label: "Default Value",
                bindable: true,
              },
              {
                key: "stringifyValue",
                valueKey: "stringifyValue",
                label: "Stringify Value",
                defaultValue: true,
                component: "toggle",
                bindable: true,
              },
              {
                key: "autoSync",
                valueKey: "autoSync",
                label: "Auto Load",
                defaultValue: true,
                help: "Disable if you want to control when the editor loads the document.",
                component: "toggle",
                bindable: true,
              },
            ],
          },
          {
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
              {
                key: "height",
                valueKey: "height",
                component: "input",
                defaultValue: "400px",
                label: "Height",
                bindable: true,
              },
              {
                key: "width",
                valueKey: "width",
                component: "input",
                defaultValue: "100%",
                label: "Width",
                bindable: true,
              },
              {
                key: "showMinimap",
                valueKey: "showMinimap",
                label: "Show Minimap",
                defaultValue: true,
                component: "toggle",
                bindable: true,
              },
            ],
          },
        ],
      },
    ],
  },
]
