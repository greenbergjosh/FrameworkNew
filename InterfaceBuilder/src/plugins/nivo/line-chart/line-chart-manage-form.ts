import { nivoColorConfigOptions } from "../_shared/nivoColors"
import { ComponentDefinition } from "../../../globalTypes"
import { baseManageForm } from "../../../components/BaseInterfaceComponent/base-manage-form"

export const lineChartManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...LineChartManageFormDefinition, ...extend)
}

export const LineChartManageFormDefinition: Partial<ComponentDefinition>[] = [
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
                defaultValue: "Line Chart",
                bindable: true,
              },
              {
                key: "valueKey",
                defaultValue: "value",
                bindable: true,
              },
              {
                key: "xScaleType",
                valueKey: "xScaleType",
                label: "X Scale",
                component: "radio",
                dataHandlerType: "local",
                hidden: false,
                hideLabel: false,
                invisible: false,
                size: "default",
                bindable: true,
                defaultValue: "point",
                data: {
                  values: [
                    {
                      label: "Point",
                      value: "point",
                    },
                    {
                      label: "Linear",
                      value: "linear",
                    },
                  ],
                },
              },
              {
                key: "yScaleType",
                valueKey: "yScaleType",
                label: "Y Scale",
                component: "radio",
                dataHandlerType: "local",
                hidden: false,
                hideLabel: false,
                invisible: false,
                size: "default",
                bindable: true,
                defaultValue: "linear",
                data: {
                  values: [
                    {
                      label: "Point",
                      value: "point",
                    },
                    {
                      label: "Linear",
                      value: "linear",
                    },
                  ],
                },
              },
              {
                key: "xFormat",
                valueKey: "xFormat",
                component: "input",
                label: "X-Format",
                placeholder: "Enter formatter",
                bindable: true,
                help:
                  "Optional formatter for x values.\n" +
                  "\n" +
                  "The formatted value can then be used for labels & tooltips.\n" +
                  "\n" +
                  "If you use a time scale, you must provide a time format as values are converted to Date objects.\n" +
                  "\n" +
                  "Under the hood, Line CHart uses d3-format, please have a look at it for available formats (https://github.com/d3/d3-format), you can also pass a function which will receive the raw value and should return the formatted one.",
              },
              {
                key: "yFormat",
                valueKey: "yFormat",
                component: "input",
                label: "Y-Format",
                placeholder: "Enter formatter",
                bindable: true,
                help:
                  "Optional formatter for y values.\n" +
                  "\n" +
                  "The formatted value can then be used for labels & tooltips.\n" +
                  "\n" +
                  "If you use a time scale, you must provide a time format as values are converted to Date objects.\n" +
                  "\n" +
                  "Under the hood, Line CHart uses d3-format, please have a look at it for available formats (https://github.com/d3/d3-format), you can also pass a function which will receive the raw value and should return the formatted one.",
              },
              {
                key: "useTooltipFunction",
                valueKey: "useTooltipFunction",
                component: "toggle",
                label: "Tooltip Custom Formatter",
                help:
                  "A function that receives the data point and returns a formatted string displayed as the tooltip of the data point.",
                bindable: true,
              },
              {
                key: "tooltipFunctionSrc",
                valueKey: "tooltipFunctionSrc",
                defaultTheme: "vs-dark",
                defaultLanguage: "javascript",
                component: "code-editor",
                height: 100,
                bindable: true,
                visibilityConditions: {
                  "===": [
                    {
                      var: ["useTooltipFunction"],
                    },
                    true,
                  ],
                },
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
                help: "Select the line chart color scheme.",
                component: "select",
                dataHandlerType: "local",
                defaultValue: "set1",
                bindable: true,
                data: {
                  values: nivoColorConfigOptions,
                },
              },
              {
                key: "showLegend",
                valueKey: "showLegend",
                component: "toggle",
                label: "Show Legend",
                bindable: true,
              },
              {
                key: "height",
                valueKey: "height",
                label: "Height",
                component: "number-input",
                defaultValue: 350,
              },
              {
                key: "width",
                valueKey: "width",
                label: "Width",
                component: "number-input",
              },
              {
                key: "lineWidth",
                valueKey: "lineWidth",
                label: "Line Width",
                component: "number-input",
                defaultValue: 2,
              },
              {
                key: "enablePoints",
                valueKey: "enablePoints",
                label: "Show Point",
                component: "toggle",
                defaultValue: true,
              },
              {
                key: "pointSize",
                valueKey: "pointSize",
                label: "Size of Point",
                component: "number-input",
                defaultValue: 6,
                visibilityConditions: {
                  "===": [
                    {
                      var: ["enablePoints"],
                    },
                    true,
                  ],
                },
              },
              {
                key: "pointBorderWidth",
                valueKey: "pointBorderWidth",
                label: "Point Border Width",
                component: "number-input",
                defaultValue: 2,
                visibilityConditions: {
                  "===": [
                    {
                      var: ["enablePoints"],
                    },
                    true,
                  ],
                },
              },
              {
                key: "enablePointLabel",
                valueKey: "enablePointLabel",
                label: "Show Point Labels",
                component: "toggle",
                defaultValue: false,
                visibilityConditions: {
                  "===": [
                    {
                      var: ["enablePoints"],
                    },
                    true,
                  ],
                },
              },
              {
                key: "enableGridX",
                valueKey: "enableGridX",
                label: "Show Vertical Grid",
                component: "toggle",
                defaultValue: true,
              },
              {
                key: "enableGridY",
                valueKey: "enableGridY",
                label: "Show Horizontal Grid",
                component: "toggle",
                defaultValue: true,
              },
              {
                key: "enableArea",
                valueKey: "enableArea",
                label: "Area Fill",
                component: "toggle",
                defaultValue: false,
              },
              {
                key: "areaBaselineValue",
                valueKey: "areaBaselineValue",
                label: "Area Baseline",
                component: "number-input",
                defaultValue: 0,
                help: "Define the value to be used for area baseline.",
                visibilityConditions: {
                  "===": [
                    {
                      var: ["enableArea"],
                    },
                    true,
                  ],
                },
              },
              {
                key: "areaOpacity",
                valueKey: "areaOpacity",
                label: "Area Opacity",
                component: "number-input",
                defaultValue: 0.2,
                help: "Area opacity (0~1).",
                visibilityConditions: {
                  "===": [
                    {
                      var: ["enableArea"],
                    },
                    true,
                  ],
                },
              },
              {
                key: "curve",
                valueKey: "curve",
                label: "Curve",
                component: "select",
                dataHandlerType: "local",
                hidden: false,
                hideLabel: false,
                invisible: false,
                size: "small",
                bindable: true,
                defaultValue: "linear",
                data: {
                  values: [
                    {
                      label: "Basis",
                      value: "basis",
                    },
                    {
                      label: "Cardinal",
                      value: "cardinal",
                    },
                    {
                      label: "Catmull Rom",
                      value: "catmullRom",
                    },
                    {
                      label: "Linear",
                      value: "linear",
                    },
                    {
                      label: "Monotone X",
                      value: "monotoneX",
                    },
                    {
                      label: "Monotone Y",
                      value: "monotoneY",
                    },
                    {
                      label: "Natural",
                      value: "natural",
                    },
                    {
                      label: "Step",
                      value: "step",
                    },
                    {
                      label: "Step After",
                      value: "stepAfter",
                    },
                    {
                      label: "Step Before",
                      value: "stepBefore",
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
