import { commonDateForm } from "./common-date-form"
import { ComponentDefinition } from "@opg/interface-builder"

interface TableDataType {
  option: { label: string; value: string }
  form: Partial<ComponentDefinition>[]
}

export const tableDataTypes: TableDataType[] = [
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
        size: "small",
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
        size: "small",
      },
    ],
  },
  {
    option: {
      label: "Boolean",
      value: "boolean",
    },
    form: [],
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
      label: "Duration",
      value: "duration",
    },
    form: [
      {
        key: "units.source",
        valueKey: "units.source",
        component: "select",
        label: "Source Units",
        defaultValue: "seconds",
        dataHandlerType: "local",
        size: "small",
        data: {
          values: [
            {
              label: "Milliseconds",
              value: "milliseconds",
            },
            {
              label: "Seconds",
              value: "seconds",
            },
            {
              label: "Minutes",
              value: "minutes",
            },
            {
              label: "Hours",
              value: "hours",
            },
            {
              label: "Days",
              value: "days",
            },
            {
              label: "Weeks",
              value: "weeks",
            },
            {
              label: "Months",
              value: "months",
            },
            {
              label: "Years",
              value: "years",
            },
          ],
        },
      },
      {
        key: "units.target",
        valueKey: "units.target",
        component: "select",
        label: "Display Units",
        defaultValue: "durationMixedUnit",
        dataHandlerType: "local",
        size: "small",
        data: {
          values: [
            {
              label: 'Mixed (e.g., "3h 22m 55s", etc.)',
              value: "durationMixedUnit",
            },
            {
              label: 'Largest Unit (e.g., "3 years")',
              value: "durationLargestUnit",
            },
            {
              label: "Milliseconds",
              value: "milliseconds",
            },
            {
              label: "Seconds",
              value: "seconds",
            },
            {
              label: "Minutes",
              value: "minutes",
            },
            {
              label: "Hours",
              value: "hours",
            },
            {
              label: "Days",
              value: "days",
            },
            {
              label: "Weeks",
              value: "weeks",
            },
            {
              label: "Months",
              value: "months",
            },
            {
              label: "Years",
              value: "years",
            },
          ],
        },
      },
      {
        key: "precision",
        valueKey: "precision",
        label: "Precision",
        help: "Set the decimal precision of the display units",
        component: "number-input",
        defaultValue: 0,
        size: "small",
      },
    ],
  },
  {
    option: {
      label: "Layout",
      value: "layout",
    },
    form: [
      {
        hidden: true,
        maxLength: null,
        valueKey: "details.type",
        label: "Hidden required value",
        hideLabel: true,
        component: "input",
        defaultValue: "layout",
        size: "small",
      },
      {
        hideLabel: false,
        label: "Data Property Mapping",
        valueKey: "details.dataMapping",
        hidden: false,
        component: "data-map",
        size: "small",
        keyComponent: {
          hideLabel: false,
          label: "Original Property Key",
          component: "input",
          valueKey: "originalKey",
          size: "small",
        },
        valueComponent: {
          hideLabel: false,
          label: "Adjusted Property Key",
          component: "input",
          valueKey: "mappedKey",
          size: "small",
        },
        multiple: true,
      },
      {
        hidden: false,
        dashed: false,
        orientation: "horizontal",
        textAlignment: "center",
        text: "",
        valueKey: "",
        label: "",
        hideLabel: false,
        component: "divider",
      },
      {
        hideLabel: true,
        label: "Cell Layout",
        valueKey: "details.layout",
        component: "user-interface",
        hideMenu: true,
      },
    ],
  },
]
