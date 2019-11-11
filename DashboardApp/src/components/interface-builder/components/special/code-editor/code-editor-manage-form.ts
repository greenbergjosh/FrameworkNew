import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

const supportedEditorLang = [
  { label: "C#", value: "csharp" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "TypeScript", value: "typescript" },
  { label: "SQL", value: "sql" },
]

const supportedEditorTheme = [
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
              //   key: "showLangSelect",
              //   valueKey: "showLangSelect",
              //   component: "checkbox",
              //   defaultValue: true,
              //   label: "Show Language Selection",
              // },
              {
                key: "defaultTheme",
                valueKey: "defaultTheme",
                component: "select",
                defaultValue: "vs",
                label: "Default Theme",
                help: "Select the highlighting theme to initially set for this code editor",
                dataHandlerType: "local",
                data: {
                  values: supportedEditorTheme,
                },
              },
              // {
              //   key: "showThemeSelect",
              //   valueKey: "showThemeSelect",
              //   component: "checkbox",
              //   defaultValue: true,
              //   label: "Show Theme Selection",
              // },
            ],
          },
        ],
      },
    ],
  },
]
