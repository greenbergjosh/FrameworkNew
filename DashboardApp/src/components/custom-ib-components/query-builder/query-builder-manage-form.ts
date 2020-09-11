import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

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
                key: "schemaRawConfigId",
                valueKey: "schemaRawConfigId",
                label: "Schema",
                help: "Schema for the data to be queried.",
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: "Components.QueryBuilder.Schema",
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
