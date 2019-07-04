export const tableDataTypes = [
  {
    option: {
      label: "Text",
      value: "string",
    },
    form: [],
  },
  {
    option: {
      label: "Number",
      value: "number",
    },
    form: [
      {
        key: "format",
        valueKey: "format",
        component: "select",
        label: "Format",
        defaultValue: "standard",
        dataHandlerType: "local",
        data: {
          values: [
            {
              label: "Standard",
              value: "standard",
            },
          ],
        },
      },
      {
        key: "negative",
        valueKey: "negative",
        component: "select",
        label: "Negative",
        defaultValue: "black",
        dataHandlerType: "local",
        data: {
          values: [
            {
              label: "Black",
              value: "black",
            },
            {
              label: "Red",
              value: "red",
            },
          ],
        },
      },
    ],
  },
  {
    option: {
      label: "Date",
      value: "date",
    },
    form: [],
  },
]
