import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
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
                bindable: true,
              },
              {
                key: "hideLabel",
                defaultValue: true,
              },
              {
                key: "valueKey",
                defaultValue: "qbData",
                bindable: true,
              },
              {
                key: "jsonLogicKey",
                valueKey: "jsonLogicKey",
                component: "input",
                label: "JsonLogic Key",
                help: "Key to to access the JsonLogic for the query.",
                defaultValue: "jsonLogic",
                bindable: true,
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
                bindable: true,
              },
              {
                key: "queryableFieldsKey",
                valueKey: "queryableFieldsKey",
                component: "input",
                label: "Queryable Fields Key",
                bindable: true,
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
                bindable: true,
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
