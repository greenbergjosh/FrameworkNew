import { baseManageForm } from "components/BaseInterfaceComponent/baseManageForm"
import { ComponentDefinition } from "../../../globalTypes"

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
                bindable: true,
              },
              {
                key: "valueKey",
                hidden: true,
              },
              {
                key: "executeImmediately",
                valueKey: "executeImmediately",
                label: "Submit on Click",
                help: "Submit the parent form on click.",
                component: "toggle",
                defaultValue: false,
                bindable: true,
              },
              // {
              //   key: "dateFormat",
              //   valueKey: "dateFormat",
              //   component: "select",
              //   label: "Format",
              //   defaultValue: "local",
              //   dataHandlerType: "local",
              //   data: {
              //     values: [
              //       {
              //         label: "ISO-8601",
              //         value: "iso-8601",
              //       },
              //       {
              //         label: "Locale",
              //         value: "locale",
              //       },
              //       {
              //         label: "GMT",
              //         value: "gmt",
              //       },
              //     ],
              //   },
              // },
              {
                key: "isDateRange",
                valueKey: "isDateRange",
                component: "toggle",
                defaultValue: true,
                label: "Date Range",
                bindable: true,
              },
              {
                key: "dateKey",
                valueKey: "dateKey",
                component: "input",
                defaultValue: "startDate",
                label: "Date Key",
                help: "The name of the date field.",
                bindable: true,
                visibilityConditions: {
                  "===": [false, { var: ["isDateRange"] }],
                },
              },
              {
                key: "startDateKey",
                valueKey: "startDateKey",
                component: "input",
                defaultValue: "startDate",
                label: "Start Date Key",
                help: "The name of the start date field.",
                bindable: true,
                visibilityConditions: {
                  "===": [true, { var: ["isDateRange"] }],
                },
              },
              {
                key: "endDateKey",
                valueKey: "endDateKey",
                component: "input",
                defaultValue: "endDate",
                label: "End Date Key",
                help: "The name of the end date field.",
                bindable: true,
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
                defaultValue: "default",
                label: "Size",
                component: "select",
                dataHandlerType: "local",
                bindable: true,
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
            ],
          },
        ],
      },
    ],
  },
]
