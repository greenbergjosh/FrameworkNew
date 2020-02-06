import { SelectParam } from "antd/lib/menu"
import { assertNever } from "../../../../../../lib/assert-never"
import {
  QueryConfig,
  ParameterItem,
  QueryLayoutItem,
  DateRangeParameterItem,
  SelectParameterItem,
} from "../../../../../../data/Report"

export const generators = {
  string: (parameter: ParameterItem): QueryLayoutItem => ({}),
  boolean: (parameter: ParameterItem): QueryLayoutItem => ({}),
  integer: (parameter: ParameterItem): QueryLayoutItem => ({}),
  float: (parameter: ParameterItem): QueryLayoutItem => ({}),
  date: (parameter: ParameterItem): QueryLayoutItem => ({
    label: parameter.label.getOrElse(parameter.name),
    displayInTimezone: "utc",
    format: "yyyy-MM-dd",
    type: "datetime",
    input: true,
    key: parameter.name,
    suffix: true,
    defaultValue: "",
    widget: {
      type: "calendar",
      displayInTimezone: "utc",
      language: "en",
      allowInput: true,
      mode: "single",
      enableTime: false,
      format: "yyyy-MM-dd",
    },
    validate: {
      required: true,
    },
    enableTime: false,
  }),
  "date-range": (parameter: ParameterItem): QueryLayoutItem => ({
    // TODO: This needs more work to refine its API
    label: parameter.label.getOrElse("Date Range"),
    columns: [
      {
        components: [
          {
            label: "Start",
            displayInTimezone: "utc",
            format: "yyyy-MM-dd",
            type: "datetime",
            input: true,
            key: "DateStart",
            suffix: true,
            defaultValue: "",
            widget: {
              type: "calendar",
              displayInTimezone: "utc",
              language: "en",
              allowInput: true,
              mode: "single",
              enableTime: false,
              format: "yyyy-MM-dd",
            },
            validate: {
              required: true,
            },
            enableTime: false,
          },
        ],
        width: 6,
        type: "column",
      },
      {
        components: [
          {
            label: "End",
            displayInTimezone: "utc",
            format: "yyyy-MM-dd",
            type: "datetime",
            input: true,
            key: "DateEnd",
            suffix: true,
            defaultValue: "",
            widget: {
              type: "calendar",
              displayInTimezone: "utc",
              language: "en",
              allowInput: true,
              mode: "single",
              enableTime: false,
              format: "yyyy-MM-dd",
            },
            validate: {
              required: true,
            },
            enableTime: false,
          },
        ],
        width: 6,
        type: "column",
      },
    ],
    type: "columns",
    key: "columns",
  }),
  select: (parameter: SelectParameterItem): QueryLayoutItem => {
    const layoutItem = {
      label: parameter.label.getOrElse("Select"),
      type: "select",
      multiple: parameter.options.multiple,
      input: true,
      key: parameter.name,
      valueProperty: "value",
      selectThreshold: 0.3,
    }

    // @ts-ignore
    if (typeof parameter.options.items !== "undefined") {
      // @ts-ignore
      layoutItem.data = { values: parameter.options.items }
    }

    return layoutItem
  },
}

export const generateLayoutFromParameters = (
  parameters: QueryConfig["parameters"]
): QueryConfig["layout"] =>
  parameters.map((parameter) => {
    switch (parameter.type) {
      case "boolean":
        return generators[parameter.type](parameter)
      case "date":
        return generators[parameter.type](parameter)
      case "date-range":
        return generators[parameter.type](parameter)
      case "float":
        return generators[parameter.type](parameter)
      case "integer":
        return generators[parameter.type](parameter)
      case "select":
        return generators[parameter.type](parameter)
      case "string":
        return generators[parameter.type](parameter)
    }
  })
