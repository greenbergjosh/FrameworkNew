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
                defaultValue: "Data",
                hidden: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
                hidden: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
                bindable: true,
              },
              {
                key: "dataType",
                valueKey: "dataType",
                label: "Data Type",
                help: "Select the type of this data",
                component: "select",
                defaultValue: "json",
                dataHandlerType: "local",
                bindable: true,
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
                      label: "Text (string)",
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
                bindable: true,
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
                bindable: true,
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
                bindable: true,
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
                bindable: true,
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
