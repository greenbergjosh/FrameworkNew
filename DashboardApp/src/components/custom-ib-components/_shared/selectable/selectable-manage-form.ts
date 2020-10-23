export const baseSelectDataComponents = [
  {
    key: "label",
    defaultValue: "Select",
  },
  {
    key: "valueKey",
    defaultValue: "value",
  },
  {
    key: "defaultValue",
    valueKey: "defaultValue",
    label: "Default Value",
    component: "input",
  },
  {
    key: "dataHandlerType",
    valueKey: "dataHandlerType",
    label: "Data Source",
    ordinal: 10,
    component: "select",
    help: "Where to fetch the data for this Select box from",
    dataHandlerType: "local",
    data: {
      values: [
        {
          label: "Options List",
          value: "local",
        },
        {
          label: "API Key",
          value: "ui-data-key",
        },
        {
          label: "Remote (Config)",
          value: "remote-config",
        },
        {
          label: "Remote (Key Value Pair)",
          value: "remote-kvp",
        },
        {
          label: "Remote (Query)",
          value: "remote-query",
        },
        {
          label: "Remote (Function)",
          value: "remote-function",
        },
        // {
        //   label: "Remote (URL)",
        //   value: "remote-url",
        // },
      ],
    },
    defaultValue: "local",
  },
  {
    key: "data",
    valueKey: "data.values",
    label: "Options",
    component: "data-map",
    defaultValue: [],
    multiple: true,
    keyComponent: {
      label: "Option Name",
      component: "input",
      valueKey: "label",
    },
    valueComponent: {
      label: "Option Value",
      component: "input",
      valueKey: "value",
    },
    visibilityConditions: {
      "===": [
        "local",
        {
          var: ["dataHandlerType"],
        },
      ],
    },
  },
  {
    key: "optionsKey",
    valueKey: "optionsKey",
    label: "Options API Key",
    component: "input",
    defaultValue: "options",
    visibilityConditions: {
      "===": [
        "ui-data-key",
        {
          var: ["dataHandlerType"],
        },
      ],
    },
  },
  {
    key: "optionLabelKey",
    valueKey: "optionLabelKey",
    label: "Option Name Key",
    component: "input",
    defaultValue: "label",
    visibilityConditions: {
      "===": [
        "ui-data-key",
        {
          var: ["dataHandlerType"],
        },
      ],
    },
  },
  {
    key: "optionValueKey",
    valueKey: "optionValueKey",
    label: "Option Value Key",
    component: "input",
    defaultValue: "value",
    visibilityConditions: {
      "===": [
        "ui-data-key",
        {
          var: ["dataHandlerType"],
        },
      ],
    },
  },
  {
    key: "remoteFunctionType",
    valueKey: "remoteFunctionType",
    label: "Remote Function",
    component: "select",
    help: "Provide a function that returns the options (Advanced).",
    dataHandlerType: "remote-config",
    remoteConfigType: "Select.RemoteFunction",
    visibilityConditions: {
      "===": [
        "remote-function",
        {
          var: ["dataHandlerType"],
        },
      ],
    },
  },
  {
    key: "remoteQuery",
    valueKey: "remoteQuery",
    label: "Remote Query",
    component: "select",
    help: "Only queries without parameters can be used as Select box options.",
    dataHandlerType: "remote-config",
    remoteDataFilter: {
      // Set of both
      or: [
        // Queries with no parameter options
        { "!": { var: "config.parameters" } },
        // and Queries with all parameter options filled in
        { all: [{ var: "config.parameters" }, { "!!": { var: "defaultValue" } }] },
      ],
    },
    remoteConfigType: "Report.Query",
    visibilityConditions: {
      and: [
        {
          "===": [
            "remote-query",
            {
              var: ["dataHandlerType"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "remoteKeyValuePair",
    valueKey: "remoteKeyValuePair",
    label: "Remote Key Value Pair",
    component: "select",
    help: "User must select from configured Key Value Pairs.",
    dataHandlerType: "remote-config",
    remoteConfigType: "KeyValuePairs",
    visibilityConditions: {
      and: [
        {
          "===": [
            "remote-kvp",
            {
              var: ["dataHandlerType"],
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
    component: "data-map",
    count: 2,
    defaultValue: [
      { label: "label", value: "" },
      { label: "value", value: "" },
    ],
    keyComponent: {
      label: "Property",
      unique: true,
      component: "select",
      valueKey: "label",
      dataHandlerType: "local",
      disabled: true,
      data: {
        values: [
          { label: "Display Label", value: "label" },
          { label: "Capture Value", value: "value" },
        ],
      },
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
          var: ["dataHandlerType"],
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
    visibilityConditions: {
      "===": [
        "remote-config",
        {
          var: ["dataHandlerType"],
        },
      ],
    },
  },
  {
    key: "allowCreateNew",
    valueKey: "allowCreateNew",
    label: "Create New Option?",
    help: "Allow the user to select 'Create New...' to create an option that doesn't currently exist.",
    component: "toggle",
    defaultValue: false,
    hidden: true,
    visibilityConditions: {
      "===": [
        "remote-config",
        {
          var: ["dataHandlerType"],
        },
      ],
    },
  },
  {
    key: "createNewLabel",
    valueKey: "createNewLabel",
    label: "'Create New...' Label",
    help: "The text to display for the option to create a new entry",
    component: "input",
    defaultValue: "Create New...",
    hidden: true,
    visibilityConditions: {
      and: [
        {
          "===": [
            "remote-config",
            {
              var: ["dataHandlerType"],
            },
          ],
        },
        {
          "===": [
            true,
            {
              var: ["allowCreateNew"],
            },
          ],
        },
      ],
    },
  },
  {
    key: "remoteURL",
    valueKey: "remoteURL",
    label: "Remote URL",
    component: "input",
    hidden: true,
    visibilityConditions: {
      "===": [
        "remote-url",
        {
          var: ["dataHandlerType"],
        },
      ],
    },
  },
]

/*
export const selectManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "base",
    components: [
      {
        key: "tabs",
        tabs: [
          {
            key: "data",
            components,
          },
        ],
      },
    ],
  },
]
*/
