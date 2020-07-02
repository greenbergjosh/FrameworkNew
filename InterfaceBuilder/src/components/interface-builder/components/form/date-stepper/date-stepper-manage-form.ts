import { commonIncludeTimeForm } from "../_shared/common-include-time-form"
import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const dateStepperManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...dateStepperManageFormDefinition, ...extend)
}

const dateStepperManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Date Stepper",
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "isDateRange",
                valueKey: "isDateRange",
                ordinal: 11,
                component: "toggle",
                defaultValue: true,
                label: "Date Range"
              },
              {
                key: "dateKey",
                valueKey: "dateKey",
                ordinal: 10,
                component: "input",
                defaultValue: "startDate",
                label: "Date API Name",
                help: "The name of the date field in the API endpoint.",
                visibilityConditions: {
                  "===": [false, { var: ["isDateRange"] }],
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
                visibilityConditions: {
                  "===": [true, { var: ["isDateRange"] }],
                },
              },
              {
                key: "endDateKey",
                valueKey: "endDateKey",
                ordinal: 11,
                component: "input",
                defaultValue: "endDate",
                label: "End Date API Name",
                help: "The name of the end date field in the API endpoint.",
                visibilityConditions: {
                  "===": [true, { var: ["isDateRange"] }],
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
                ordinal: 10,
                defaultValue: "default",
                label: "Size",
                component: "select",
                dataHandlerType: "local",
                data: {
                  values: [
                    {
                      label: "Small",
                      value: "small",
                    },
                    {
                      label: "Default",
                      value: "default",
                    },
                    {
                      label: "Large",
                      value: "large",
                    },
                  ],
                },
              },
            ]
          },
        ],
      },
    ],
  },
]
