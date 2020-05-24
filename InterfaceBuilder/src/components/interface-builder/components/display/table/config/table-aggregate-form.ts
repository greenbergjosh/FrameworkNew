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
            label: "Custom (Advanced, uses your configuration)",
            value: "Custom",
          },
        ],
      },
    },
    {
      key: "customAggregateId",
      valueKey: "customAggregateId",
      component: "select",
      label: "Custom Aggregate",
      help: "Custom function to aggregate this column",
      dataHandlerType: "remote-config",
      remoteConfigType: "Report.CustomAggregate",
      visibilityConditions: {
        "===": ["Custom", { var: "aggregationFunction" }],
      },
    },
    {
      key: "customAggregateOptions",
      valueKey: "customAggregateOptions",
      label: "Custom Aggregate Options",
      help: "Give additional properties to format the aggregate content",
      component: "data-map",
      defaultValue: [],
      multiple: true,
      keyComponent: {
        label: "Key",
        component: "input",
        valueKey: "key",
      },
      valueComponent: {
        label: "Value",
        component: "textarea",
        valueKey: "value",
      },
      visibilityConditions: {
        "===": ["Custom", { var: "aggregationFunction" }],
      },
    },
  ],
} as SectionDefinition