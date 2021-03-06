export const baseSelectDataComponents = [
  {
    key: "label",
    defaultValue: "Select",
    bindable: true,
  },
  {
    key: "valueKey",
    defaultValue: "value",
    bindable: true,
  },
  {
    key: "defaultValue",
    valueKey: "defaultValue",
    label: "Default Value",
    component: "input",
    bindable: true,
  },
  {
    key: "dataHandlerType",
    valueKey: "dataHandlerType",
    label: "Data Source",
    ordinal: 10,
    component: "select",
    help: "Where to fetch the data for this Select box from",
    dataHandlerType: "local",
    bindable: true,
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
    bindable: true,
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
