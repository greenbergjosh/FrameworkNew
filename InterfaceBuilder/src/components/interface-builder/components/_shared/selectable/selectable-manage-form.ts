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
      ],
    },
    defaultValue: "local",
    hidden: true,
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
