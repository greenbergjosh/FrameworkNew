import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const stringTemplateManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...stringTemplateManageFormDefinition, ...extend)
}

const stringTemplateManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Template",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "components",
              },
              {
                valueKey: "serializeSrc",
                label: "Serialize",
                help: "Optional. The serialize function must take a JSON object and return a string.",
                defaultTheme: "vs-dark",
                defaultLanguage: "javascript",
                hidden: false,
                hideLabel: false,
                component: "code-editor",
                height: 200,
              },
              {
                valueKey: "deserializeSrc",
                label: "Deserialize",
                help: `Optional. The deserialize function must take a string and return
                  a JSON object with properties that match each "API Key" used in the embedded controls.`,
                defaultTheme: "vs-dark",
                defaultLanguage: "javascript",
                hidden: false,
                hideLabel: false,
                component: "code-editor",
                height: 200,
              },
            ],
          },
        ],
      },
    ],
  },
]
