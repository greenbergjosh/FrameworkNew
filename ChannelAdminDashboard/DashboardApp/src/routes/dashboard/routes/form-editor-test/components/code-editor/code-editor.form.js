import baseEditForm from "formiojs/components/base/Base.form"

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

export default function(...extend) {
  return baseEditForm(
    [
      {
        key: "display",
        components: [
          {
            key: "labelPosition",
            ignore: true,
          },
          {
            key: "persistent",
            ignore: true,
          },
          {
            key: "multiple",
            ignore: true,
          },
          {
            key: "reorder",
            ignore: true,
          },
          {
            key: "protected",
            ignore: true,
          },
          {
            key: "mask",
            ignore: true,
          },
        ],
      },
      {
        label: "Code",
        key: "code",
        weight: 1,
        components: [
          {
            type: "select",
            input: true,
            key: "defaultLanguage",
            defaultValue: "json",
            label: "Default Language",
            tooltip: "Select the code language to initially set for this code editor",
            dataSrc: "values",
            data: {
              values: supportedEditorLang,
            },
            weight: 10,
          },
          {
            type: "checkbox",
            input: true,
            key: "showLangSelect",
            defaultValue: true,
            label: "Show Language Selection",
            weight: 10.1,
          },
          {
            type: "select",
            input: true,
            key: "defaultTheme",
            defaultValue: "vs",
            label: "Default Theme",
            tooltip: "Select the highlighting theme to initially set for this code editor",
            dataSrc: "values",
            data: {
              values: supportedEditorTheme,
            },
            weight: 20,
          },
          {
            type: "checkbox",
            input: true,
            key: "showThemeSelect",
            defaultValue: true,
            label: "Show Theme Selection",
            weight: 20.1,
          },
        ],
      },
    ],
    ...extend
  )
}
