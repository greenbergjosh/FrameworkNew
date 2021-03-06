import { commonIncludeTimeForm } from "@opg/interface-builder-plugins/lib/ant/shared"
import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const settings = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...dateRangeManageFormDefinition, ...extend)
}

const dateRangeManageFormDefinition: Partial<ComponentDefinition>[] = [
  {
    key: "base",
    components: [
      {
        key: "tabs",
        tabs: [
          {
            key: "data",
            components: [
              {
                key: "label",
                defaultValue: "Date Range",
                bindable: true,
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "defaultRangeValue",
                valueKey: "defaultRangeValue",
                ordinal: 0,
                component: "select",
                label: "Default Range Value",
                help: "The initial value of the range",
                defaultValue: "Today",
                dataHandlerType: "local",
                bindable: true,
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
              {
                key: "startDateKey",
                valueKey: "startDateKey",
                ordinal: 10,
                component: "input",
                defaultValue: "startDate",
                label: "Start Date API Name",
                help: "The name of the start date field in the API endpoint.",
                bindable: true,
              },
              {
                key: "endDateKey",
                valueKey: "endDateKey",
                ordinal: 11,
                component: "input",
                defaultValue: "endDate",
                label: "End Date API Name",
                help: "The name of the end date field in the API endpoint.",
                bindable: true,
              },
              {
                key: "useWrapperObject",
                valueKey: "useWrapperObject",
                ordinal: 20,
                component: "checkbox",
                defaultValue: false,
                label: "Use API Wrapper Object",
                help: "Whether to send the start and end values as two separate values or contained in an object.",
                bindable: true,
              },
              {
                key: "wrapperObjectKey",
                valueKey: "wrapperObjectKey",
                ordinal: 21,
                component: "input",
                defaultValue: "dateRange",
                label: "Wrapper Object API Name",
                help: "The name of the wrapper object field in the API endpoint.",
                bindable: true,
                visibilityConditions: {
                  "===": [
                    true,
                    {
                      var: ["useWrapperObject"],
                    },
                  ],
                },
              },
            ],
          },
          {
            key: "appearance",
            components: [...commonIncludeTimeForm],
          },
        ],
      },
    ],
  },
]
