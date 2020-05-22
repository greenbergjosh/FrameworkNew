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
      label: "Layout",
      value: "layout",
    },
    form: [
      {
        "hidden": true,
        "maxLength": null,
        "valueKey": "details.type",
        "label": "Hidden required value",
        "hideLabel": true,
        "component": "input",
        "defaultValue": "layout"
      },
      {
        "hideLabel": false,
        "label": "Data Property Mapping",
        "valueKey": "details.dataMapping",
        "hidden": false,
        "component": "data-map",
        "keyComponent": {
          "hideLabel": false,
          "label": "Original Property Key",
          "component": "input",
          "valueKey": "originalKey"
        },
        "valueComponent": {
          "hideLabel": false,
          "label": "Adjusted Property Key",
          "component": "input",
          "valueKey": "mappedKey"
        },
        "multiple": true,
      },
      {
        "hidden": false,
        "dashed": false,
        "orientation": "horizontal",
        "textAlignment": "center",
        "text": "",
        "valueKey": "",
        "label": "",
        "hideLabel": false,
        "component": "divider"
      },
      {
        "hideLabel": true,
        "label": "",
        "valueKey": "details.layout",
        "component": "user-interface",
      },
    ],
  },
]
