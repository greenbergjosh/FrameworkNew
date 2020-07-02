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
          label: "Local",
          value: "local",
        },
        {
          label: "Local Function",
          value: "local-function",
        },
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
    key: "localFunctionDataHandler",
    valueKey: "localFunctionDataHandler",
    label: "Local Function",
    component: "code-editor",
    defaultLanguage: "javascript",
    defaultTheme: "vs-dark",
    hidden: false,
    hideLabel: false,
    defaultValue: "return function getOptions(data) {\n    const options = [\n        { label: \"Example 1\", value: \"example1\" },\n        { label: \"Example 2\", value: \"example2\" },\n        { label: \"Example 3\", value: \"example3\" },\n    ]\n    return options\n}",
    visibilityConditions: {
      "===": [
        "local-function",
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
