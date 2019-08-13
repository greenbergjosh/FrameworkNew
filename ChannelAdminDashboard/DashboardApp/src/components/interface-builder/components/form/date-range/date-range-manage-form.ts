import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const dateRangeManageForm = (...extend: Partial<ComponentDefinition>[]) => {
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
              },
              {
                key: "endDateKey",
                valueKey: "endDateKey",
                ordinal: 11,
                component: "input",
                defaultValue: "endDate",
                label: "End Date API Name",
                help: "The name of the end date field in the API endpoint.",
              },
              {
                key: "timeSettings.includeTime",
                valueKey: "timeSettings.includeTime",
                ordinal: 12,
                component: "toggle",
                defaultValue: false,
                label: "Include Time Picker?",
                help: "Indicates whether to allow picking time in the ranges as well as date.",
              },
              {
                key: "timeSettingsColumnsWrapper",
                valueKey: "timeSettingsColumnsWrapper",
                component: "form",
                formColumnLayout: {
                  labelCol: {
                    sm: { span: 24 },
                    md: { span: 16 },
                    lg: { span: 18 },
                    xl: { span: 19 },
                  },
                  wrapperCol: {
                    sm: { span: 24 },
                    md: { span: 8 },
                    lg: { span: 6 },
                    xl: { span: 5 },
                  },
                },
                orientation: "vertical",
                components: [
                  {
                    key: "timeSettingsColumns",
                    valueKey: "timeSettingsColumns",
                    showLabel: false,
                    label: "",
                    component: "column",
                    columns: [
                      {
                        hideTitle: true,
                        components: [
                          {
                            key: "timeSettings.includeHour",
                            valueKey: "timeSettings.includeHour",
                            ordinal: 13,
                            component: "toggle",
                            defaultValue: false,
                            label: "Allow Choosing Hour?",
                            help: "Along with the date, is the user allowed to pick an hour?",
                          },
                        ],
                      },
                      {
                        hideTitle: true,
                        components: [
                          {
                            key: "timeSettings.includeMinute",
                            valueKey: "timeSettings.includeMinute",
                            ordinal: 14,
                            component: "toggle",
                            defaultValue: false,
                            label: "Allow Choosing Minute?",
                            help: "Along with the date, is the user allowed to pick a minute?",
                          },
                        ],
                      },
                      {
                        hideTitle: true,
                        components: [
                          {
                            key: "timeSettings.includeSecond",
                            valueKey: "timeSettings.includeSecond",
                            ordinal: 15,
                            component: "toggle",
                            defaultValue: false,
                            label: "Allow Choosing Second?",
                            help: "Along with the date, is the user allowed to pick a second?",
                          },
                        ],
                      },
                    ],
                    visibilityConditions: {
                      "===": [true, { var: "timeSettings.includeTime" }],
                    },
                  },
                ],
              },
              {
                key: "timeSettings.use24Clock",
                valueKey: "timeSettings.use24Clock",
                ordinal: 16,
                component: "toggle",
                defaultValue: false,
                label: "Use 24 Hour Clock?",
                help: "Turn this on to remove AM/PM and use hours from 00 to 23. ",
                visibilityConditions: {
                  "===": [true, { var: "timeSettings.includeTime" }],
                },
              },
              {
                key: "useWrapperObject",
                valueKey: "useWrapperObject",
                ordinal: 20,
                component: "checkbox",
                defaultValue: false,
                label: "Use API Wrapper Object",
                help:
                  "Whether to send the start and end values as two separate values or contained in an object.",
              },
              {
                key: "wrapperObjectKey",
                valueKey: "wrapperObjectKey",
                ordinal: 21,
                component: "input",
                defaultValue: "dateRange",
                label: "Wrapper Object API Name",
                help: "The name of the wrapper object field in the API endpoint.",
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
        ],
      },
    ],
  },
]
