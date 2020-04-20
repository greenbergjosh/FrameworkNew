import { commonDateForm } from "./common-date-form"

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
            {
              label: "Currency",
              value: "currency",
            },
            {
              label: "Percentage",
              value: "percentage",
            },
          ],
        },
      },
      {
        key: "precision",
        valueKey: "precision",
        label: "Precision",
        help: "Set the decimal precision of the number type",
        component: "number-input",
        defaultValue: 2,
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
            // {
            //   label: "Red",
            //   value: "red",
            // },
          ],
        },
      },
    ],
  },
  {
    option: {
      label: "Date (Without Time)",
      value: "date",
    },
    form: commonDateForm,
  },
  {
    option: {
      label: "Date and Time",
      value: "dateTime",
    },
    form: commonDateForm,
  },
  {
    option: {
      label: "Component",
      value: "component",
    },
    form: [],
  },
]
