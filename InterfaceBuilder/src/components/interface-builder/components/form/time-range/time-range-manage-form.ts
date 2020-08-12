import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const timeRangeManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...timeRangeManageFormDefinition, ...extend)
}

const timeRangeManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Time Range",
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "startTimeKey",
                valueKey: "startTimeKey",
                ordinal: 10,
                component: "input",
                defaultValue: "startTime",
                label: "Start Time API Name",
                help: "The name of the start time field in the API endpoint.",
              },
              {
                key: "endTimeKey",
                valueKey: "endTimeKey",
                ordinal: 11,
                component: "input",
                defaultValue: "endTime",
                label: "End Time API Name",
                help: "The name of the end time field in the API endpoint.",
              },
              {
                key: "useWrapperObject",
                valueKey: "useWrapperObject",
                ordinal: 12,
                component: "checkbox",
                defaultValue: false,
                label: "Use API Wrapper Object",
                help: "Whether to send the start and end values as two separate values or contained in an object.",
              },
              {
                key: "wrapperObjectKey",
                valueKey: "wrapperObjectKey",
                ordinal: 13,
                component: "input",
                defaultValue: "timeRange",
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
          {
            key: "appearance",
            components: [
              {
                key: "size",
                valueKey: "size",
                component: "select",
                label: "Size",
                defaultValue: "default",
                dataHandlerType: "local",
                ordinal: 12,
                data: {
                  values: [
                    {
                      label: "Small",
                      value: "small",
                    },
                    {
                      label: "Medium (Default)",
                      value: "default",
                    },
                    {
                      label: "Large",
                      value: "large",
                    },
                  ],
                },
              },
              {
                key: "startTimePlaceholder",
                valueKey: "startTimePlaceholder",
                ordinal: 14,
                component: "input",
                defaultValue: "Start Time",
                label: "Start Time Placeholder",
              },
              {
                key: "endTimePlaceholder",
                valueKey: "endTimePlaceholder",
                ordinal: 15,
                component: "input",
                defaultValue: "End Time",
                label: "End Time Placeholder",
              },
            ],
          },
        ],
      },
    ],
  },
]
