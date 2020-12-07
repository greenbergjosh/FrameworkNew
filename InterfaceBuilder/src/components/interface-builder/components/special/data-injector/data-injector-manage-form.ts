import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const dataInjectorManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...textManageFormDefinition, ...extend)
}

export const textManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Text",
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
              },
              {
                key: "dataType",
                valueKey: "dataType",
                label: "Data Type",
                help: "Select the type of this data",
                component: "select",
                defaultValue: "json",
                dataHandlerType: "local",
                data: {
                  values: [
                    {
                      label: "JSON",
                      value: "json",
                    },
                    {
                      label: "Number",
                      value: "number",
                    },
                    {
                      label: "Text",
                      value: "string",
                    },
                    {
                      label: "Boolean",
                      value: "boolean",
                    },
                  ],
                },
              },
              {
                key: "jsonValue",
                valueKey: "jsonValue",
                label: "JSON Value",
                help: "The JSON data to be injected.",
                defaultTheme: "vs-dark",
                defaultLanguage: "json",
                defaultValue: "{}",
                hidden: false,
                hideLabel: false,
                component: "code-editor",
                height: 100,
                visibilityConditions: {
                  "===": ["json", { var: "dataType" }],
                },
              },
              {
                key: "booleanValue",
                valueKey: "booleanValue",
                component: "toggle",
                defaultValue: false,
                label: "Boolean Value",
                visibilityConditions: {
                  "===": ["boolean", { var: "dataType" }],
                },
              },
              {
                key: "stringValue",
                valueKey: "stringValue",
                component: "input",
                defaultValue: "",
                label: "String Value",
                visibilityConditions: {
                  "===": ["string", { var: "dataType" }],
                },
              },
              {
                key: "numberValue",
                valueKey: "numberValue",
                component: "number-input",
                label: "Number Value",
                defaultValue: 0,
                visibilityConditions: {
                  "===": ["number", { var: "dataType" }],
                },
              },
            ],
          },
          {
            key: "appearance",
            components: [],
          },
        ],
      },
    ],
  },
]
