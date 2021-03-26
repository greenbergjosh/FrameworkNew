import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const queryManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...queryManageFormDefinition, ...extend)
}

const queryManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                key: "hideLabel",
                defaultValue: true,
                hidden: true,
              },
              {
                key: "label",
                defaultValue: null,
                hidden: true,
              },
              {
                key: "valueKey",
                defaultValue: "data",
                bindable: true,
              },
              {
                key: "header",
                valueKey: "header",
                component: "input",
                label: "Header",
                bindable: true,
              },
              {
                key: "queryType",
                valueKey: "queryType",
                label: "Data Source",
                component: "select",
                help: "How to fetch the data for this query",
                dataHandlerType: "local",
                bindable: true,
                data: {
                  values: [
                    {
                      label: "Remote (Query)",
                      value: "remote-query",
                    },
                    {
                      label: "Remote (Config)",
                      value: "remote-config",
                    },

                    // {
                    //   label: "Remote (URL)",
                    //   value: "remote-url",
                    // },
                  ],
                },
                defaultValue: "remote-query",
              },

              {
                key: "remoteQuery",
                valueKey: "remoteQuery",
                label: "Remote Query",
                component: "select",
                help: "Only queries without parameters can be used as Select box options.",
                dataHandlerType: "remote-config",
                // remoteDataFilter: {
                //   // Set of both
                //   or: [
                //     // Queries with no parameter options
                //     { "!": { var: "config.parameters" } },
                //     // and Queries with all parameter options filled in
                //     { all: [{ var: "config.parameters" }, { "!!": { var: "defaultValue" } }] },
                //   ],
                // },
                remoteConfigType: "Report.Query",
                bindable: true,
                visibilityConditions: {
                  and: [
                    {
                      "===": [
                        "remote-query",
                        {
                          var: ["queryType"],
                        },
                      ],
                    },
                  ],
                },
              },

              {
                key: "remoteQueryMapping",
                valueKey: "remoteQueryMapping",
                label: "Query Mapping",
                help: "Forfields that need property name transformations applied, describe these here",
                component: "data-map",
                count: 2,
                defaultValue: [
                  { label: "label", value: "" },
                  { label: "value", value: "" },
                ],
                bindable: true,
                keyComponent: {
                  label: "Property",
                  component: "input",
                  valueKey: "value",
                },
                valueComponent: {
                  label: "Mapping",
                  component: "input",
                  valueKey: "value",
                },
                visibilityConditions: {
                  "===": [
                    "remote-query",
                    {
                      var: ["queryType"],
                    },
                  ],
                },
              },
              {
                key: "remoteConfigType",
                valueKey: "remoteConfigType",
                label: "Remote Config Type",
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: "EntityType",
                bindable: true,
                visibilityConditions: {
                  "===": [
                    "remote-config",
                    {
                      var: ["queryType"],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
