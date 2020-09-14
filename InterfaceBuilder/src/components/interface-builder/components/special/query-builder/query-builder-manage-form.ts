import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const queryBuilderManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...queryBuilderManageFormDefinition, ...extend)
}

export const queryBuilderManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                key: "exposeQueryableFields",
                valueKey: "exposeQueryableFields",
                ordinal: 11,
                component: "toggle",
                label: "Expose Queryable Fields",
                help:
                  "Make the queryable fields (root properties) available on the data model when the schema is loaded.",
                defaultValue: false,
              },
              {
                key: "queryableFieldsKey",
                valueKey: "queryableFieldsKey",
                component: "input",
                label: "Queryable Fields Key",
                visibilityConditions: {
                  "===": [
                    true,
                    {
                      var: ["exposeQueryableFields"],
                    },
                  ],
                },
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
