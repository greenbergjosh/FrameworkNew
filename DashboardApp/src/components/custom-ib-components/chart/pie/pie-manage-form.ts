import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"

export const pieManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...PieManageFormDefinition, ...extend)
}

export const PieManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                key: "sliceValueKey",
                valueKey: "sliceValueKey",
                component: "input",
                label: "Slice Value Key",
                defaultValue: "value",
              },
              {
                key: "sliceLabelValueType",
                valueKey: "sliceLabelValueType",
                label: "Slice Label Value Type",
                help:
                  "How to display the slice label: \
                Default: The value of the slice\
                Key: The property to display\
                Function: A function that receives the slice and returns a formatted string displayed as the value of the slice.",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "default",
                data: {
                  values: [
                    {
                      label: "Default",
                      value: "default",
                    },
                    {
                      label: "Key",
                      value: "key",
                    },
                    {
                      label: "Function",
                      value: "function",
                    },
                  ],
                },
              },
              {
                key: "sliceLabelValueKey",
                valueKey: "sliceLabelValueKey",
                component: "input",
                label: "Slice Label Value Key",
                defaultValue: "value",
                visibilityConditions: {
                  "===": [
                    {
                      var: ["sliceLabelValueType"],
                    },
                    "key",
                  ],
                },
              },
              {
                key: "sliceLabelValueFunctionConfigId",
                valueKey: "sliceLabelValueFunctionConfigId",
                label: "Slice Label Value Function",
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: "Components.PieChart.SliceLabelValueFunction",
                visibilityConditions: {
                  "===": [
                    {
                      var: ["sliceLabelValueType"],
                    },
                    "function",
                  ],
                },
              },
              {
                keyLabel: "Parameter Name",
                valueKey: "sliceLabelValueFunctionParameters",
                label: "Function Parameters",
                component: "data-dictionary",
                valueComponent: [
                  {
                    size: "default",
                    invisible: false,
                    hidden: false,
                    maxLength: null,
                    valueKey: "value",
                    label: "Parameter Value",
                    hideLabel: true,
                    component: "input",
                  },
                ],
                visibilityConditions: {
                  "===": [
                    {
                      var: ["sliceLabelValueType"],
                    },
                    "function",
                  ],
                },
              },
              {
                key: "useTooltipFunction",
                valueKey: "useTooltipFunction",
                component: "toggle",
                label: "Tooltip Custom Formatter",
                help:
                  "A function that receives the slice and returns a formatted string displayed as the tooltip of the slice.",
              },
              {
                key: "tooltipFunctionConfigId",
                valueKey: "tooltipFunctionConfigId",
                label: "Tooltip Function",
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: "Components.PieChart.TooltipFunction",
                visibilityConditions: {
                  "===": [
                    {
                      var: ["useTooltipFunction"],
                    },
                    true,
                  ],
                },
              },
              {
                keyLabel: "Parameter Name",
                valueKey: "tooltipFunctionParameters",
                label: "Function Parameters",
                component: "data-dictionary",
                valueComponent: [
                  {
                    size: "default",
                    invisible: false,
                    hidden: false,
                    maxLength: null,
                    valueKey: "value",
                    label: "Parameter Value",
                    hideLabel: true,
                    component: "input",
                  },
                ],
                visibilityConditions: {
                  "===": [
                    {
                      var: ["useTooltipFunction"],
                    },
                    true,
                  ],
                },
              },
              {
                key: "sliceGap",
                valueKey: "sliceGap",
                label: "Slice Gap",
                component: "number-input",
                defaultValue: 2,
              },
              {
                key: "preSorted",
                valueKey: "preSorted",
                label: "Data is pre-sorted",
                component: "toggle",
                defaultValue: false,
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
                key: "enableSliceLabels",
                valueKey: "enableSliceLabels",
                label: "Slice Labels",
                component: "toggle",
                defaultValue: true,
              },
              {
                key: "enableRadialLabels",
                valueKey: "enableRadialLabels",
                label: "Radial Labels",
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
                help:
                  'Set the cutoff value to display. Values below this amount will be aggregated into an "Other" slice.',
                component: "number-input",
                defaultValue: 0,
              },
              {
                key: "otherAggregatorFunctionConfigId",
                valueKey: "otherAggregatorFunctionConfigId",
                label: "Other Slice Aggregator Function",
                component: "select",
                dataHandlerType: "remote-config",
                remoteConfigType: "Components.PieChart.OtherSliceAggregatorFunction",
                visibilityConditions: {
                  ">": [
                    {
                      var: ["threshold"],
                    },
                    0,
                  ],
                },
              },
              {
                keyLabel: "Parameter Name",
                valueKey: "otherAggregatorFunctionParameters",
                label: "Function Parameters",
                component: "data-dictionary",
                valueComponent: [
                  {
                    size: "default",
                    invisible: false,
                    hidden: false,
                    maxLength: null,
                    valueKey: "value",
                    label: "Parameter Value",
                    hideLabel: true,
                    component: "input",
                  },
                ],
                visibilityConditions: {
                  ">": [
                    {
                      var: ["threshold"],
                    },
                    0,
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
