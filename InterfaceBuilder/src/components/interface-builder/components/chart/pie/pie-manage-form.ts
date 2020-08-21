import { baseManageForm } from "../../base/base-component-form"
import { ComponentDefinition } from "../../base/BaseInterfaceComponent"

export const pieManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...pieManageFormDefinition, ...extend)
}

const pieManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Pie Chart",
              },
              {
                key: "valueKey",
                defaultValue: "value",
              },
              {
                key: "sliceLabelKey",
                valueKey: "sliceLabelKey",
                component: "input",
                label: "Slice Label Name Key",
                defaultValue: "label",
              },
              {
                key: "sliceLabelValueKey",
                valueKey: "sliceLabelValueKey",
                component: "input",
                label: "Slice Label Value Key",
                defaultValue: "value",
              },
              {
                key: "sliceLabelValueFunction",
                valueKey: "sliceLabelValueFunction",
                component: "input",
                label: "Slice Label Value Function",
                help: "A function that receives the slice value and returns a formatted string.",
              },
              {
                key: "sliceValueKey",
                valueKey: "sliceValueKey",
                component: "input",
                label: "Slice Value Key",
                defaultValue: "value",
              },
              {
                key: "sliceGap",
                valueKey: "sliceGap",
                label: "Slice Gap",
                component: "number-input",
                defaultValue: 2,
              },
            ],
          },
          {
            key: "appearance",
            components: [
              {
                key: "colorScheme",
                valueKey: "colorScheme",
                label: "Colors",
                help: "Select the pie slices color scheme.",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "set1",
                data: {
                  values: [
                    {
                      label: "Default",
                      value: "set1",
                    },
                    {
                      label: "Bold 1",
                      value: "set2",
                    },
                    {
                      label: "Bold 2",
                      value: "set3",
                    },
                    {
                      label: "Accent",
                      value: "set4",
                    },
                    {
                      label: "Pastel",
                      value: "set5",
                    },
                    {
                      label: "Red, Yellow, Blue",
                      value: "set6",
                    },
                    {
                      label: "Yellow, Green, Blue",
                      value: "set7",
                    },
                    {
                      label: "Yellow, Orange, Red",
                      value: "set8",
                    },
                    {
                      label: "Purple, Blue, Green",
                      value: "set9",
                    },
                  ],
                },
              },
              {
                key: "donut",
                valueKey: "donut",
                label: "Donut",
                component: "toggle",
                defaultValue: true,
              },
              {
                key: "showLegend",
                valueKey: "showLegend",
                label: "Legend",
                component: "toggle",
                defaultValue: false,
              },
              {
                key: "threshold",
                valueKey: "threshold",
                label: "Threshold",
                help: "Set the cutoff value to display. Values below this amount will be aggregated into an \"Other\" slice.",
                component: "number-input",
                defaultValue: 0,
              },
            ],
          },
        ],
      },
    ],
  },
]
