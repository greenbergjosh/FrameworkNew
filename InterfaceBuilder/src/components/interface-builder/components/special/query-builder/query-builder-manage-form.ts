import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"
import jsonLogic from "./sample-data/savedJsonLogicQuery"

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

export const queryBuilderManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...queryBuilderFormDefinition, ...extend)
}

const queryBuilderFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Query Builder",
              },
              {
                key: "valueKey",
                defaultValue: "query",
              },
              {
                key: "schemaRaw",
                valueKey: "schemaRaw",
                component: "code-editor",
                label: "Schema",
                help: "Schema for the data to be queried.",
                defaultValue: "{}",
                defaultTheme: "vs-dark",
                defaultLanguage: "json",
                height: 100,
              },
            ],
          },
          {
            label: "Appearance",
            key: "appearance",
            components: [],
          },
        ],
      },
    ],
  },
]
