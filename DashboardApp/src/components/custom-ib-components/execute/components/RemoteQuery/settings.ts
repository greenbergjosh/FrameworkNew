export const remoteQuerySettings = [
  {
    center: false,
    headerSize: "4",
    textType: "title",
    invisible: false,
    hidden: false,
    stringTemplate: "Remote Query Settings",
    useTokens: false,
    valueKey: "data",
    label: "Text",
    hideLabel: true,
    component: "text",
    marginBottom: 20,
    components: [],
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
    key: "RemoteQuery_isCRUD",
    valueKey: "RemoteQuery_isCRUD",
    component: "toggle",
    defaultValue: false,
    label: "CRUD Operation",
    help: "Does this query CReate Update or Delete data?",
    visibilityConditions: {
      or: [
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
    key: "remoteQuery",
    valueKey: "remoteQuery",
    label: "TGWD Query",
    component: "select",
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
    label: "Query Fields",
    help: "For fields that need property name transformations applied, describe these here",
    component: "data-map",
    count: 2,
    defaultValue: [
      { label: "label", value: "" },
      { label: "value", value: "" },
    ],
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
]
