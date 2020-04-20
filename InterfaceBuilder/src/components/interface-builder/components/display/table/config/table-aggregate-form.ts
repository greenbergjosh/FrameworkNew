import { SectionDefinition } from "../../collapse/CollapseInterfaceComponent"

export const tableAggregateForm = {
  title: "Aggregate",
  components: [
    {
      key: "aggregationFunction",
      valueKey: "aggregationFunction",
      label: "Method",
      help: "How to aggregate this column",
      component: "select",
      dataHandlerType: "local",
      data: {
        values: [
          {
            label: "Sum",
            value: "Sum",
          },
          {
            label: "Average",
            value: "Average",
          },
          {
            label: "Average (Ignore Blanks)",
            value: "CustomIgnoreBlankAverage",
          },
          {
            label: "Minimum",
            value: "Min",
          },
          {
            label: "Maximum",
            value: "Max",
          },
          {
            label: "Count",
            value: "Count",
          },
          {
            label: "Count (True)",
            value: "Truecount",
          },
          {
            label: "Count (False)",
            value: "Falsecount",
          },
          {
            label: "Count (Has Value)",
            value: "CustomValueCount",
          },
          {
            label: "Count (Has No Value)",
            value: "CustomNullCount",
          },
        ],
      },
    },
  ],
} as SectionDefinition
