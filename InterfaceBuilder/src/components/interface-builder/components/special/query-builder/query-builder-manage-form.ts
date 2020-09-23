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
                defaultValue: "qbData",
              },
              {
                key: "jsonLogicKey",
                valueKey: "jsonLogicKey",
                component: "input",
                label: "JsonLogic Key",
                help: "Key to to access the JsonLogic for the query.",
                defaultValue: "jsonLogic",
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
                key: "schemaKey",
                valueKey: "schemaKey",
                component: "input",
                label: "Schema Key",
                help: "Key to to access the schema for the data to be queried.",
                defaultValue: "schema",
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
