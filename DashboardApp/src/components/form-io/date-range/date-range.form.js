import baseEditForm from "../base.form"

export default function(...extend) {
  return baseEditForm(
    [
      {
        key: "api",
        components: [
          {
            key: "key",
            ignore: true,
          },
          {
            weight: 0,
            type: "textfield",
            input: true,
            key: "startDateKey",
            defaultValue: "startDate",
            label: "Start Date Name",
            tooltip: "The name of the start date field in the API endpoint.",
            validate: {
              pattern: "[A-Za-z0-9-.]+",
              patternMessage: "The property name must only contain alpha numeric characters.",
            },
          },
          {
            weight: 10,
            type: "textfield",
            input: true,
            key: "endDateKey",
            defaultValue: "endDate",
            label: "End Date Name",
            tooltip: "The name of the end date field in the API endpoint.",
            validate: {
              pattern: "[A-Za-z0-9-.]+",
              patternMessage: "The property name must only contain alpha numeric characters.",
            },
          },
          {
            type: "select",
            input: true,
            key: "defaultRangeValue",
            label: "Default Range Value",
            tooltip: "The initial value of the range",
            weight: 20,
            defaultValue: "Today",
            dataSrc: "values",
            data: {
              values: [
                { label: "Empty", value: "Empty" },
                { label: "Today", value: "Today" },
                { label: "Yesterday", value: "Yesterday" },
                { label: "This Week", value: "This Week" },
                { label: "Last Week", value: "Last Week" },
                { label: "This Month", value: "This Month" },
                { label: "Last Month", value: "Last Month" },
                { label: "YTD", value: "YTD" },
              ],
            },
          },
        ],
      },
    ],
    ...extend
  )
}
