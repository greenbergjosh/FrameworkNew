import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const supportedEditorLang = [
  { label: "C#", value: "csharp" },
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

export const codeEditorManageForm = (...extend: Partial<ComponentDefinition>[]) => {
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
              },
              {
                key: "valueKey",
                defaultValue: "code",
              },
              {
                key: "defaultValue",
                valueKey: "defaultValue",
                component: "code-editor",
                defaultTheme: "vs-dark",
                label: "Default Value",
              },
            ],
          },
          {
            label: "Code",
            key: "code",
            components: [
              // {
              //   key: "allowDiffView",
              //   valueKey: "allowDiffView",
              //   component: "checkbox",
              //   defaultValue: true,
              //   help: "Let's the user open a side-by-side comparison of the old and new values",
              //   label: "Allow Diff Viewer Option",
              // },
              {
                key: "defaultLanguage",
                valueKey: "defaultLanguage",
                component: "select",
                defaultValue: "json",
                label: "Default Language",
                help: "Select the code language to initially set for this code editor",
                dataHandlerType: "local",
                data: {
                  values: supportedEditorLang,
                },
              },
              // {
              //   key: "allowLangSelect",
              //   valueKey: "allowLangSelect",
              //   component: "checkbox",
              //   defaultValue: true,
              //   label: "Allow Language Selection",
              // },
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
              // {
              //   key: "allowThemeSelect",
              //   valueKey: "allowThemeSelect",
              //   component: "checkbox",
              //   defaultValue: true,
              //   label: "Allow Theme Selection",
              // },
            ],
          },
        ],
      },
    ],
  },
]
